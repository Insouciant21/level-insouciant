type CacheOptions = {
  ttlMs?: number
  maxEntries?: number
  maxBytes?: number
  maxEntryBytes?: number
}

type CachedPage = {
  body: Uint8Array
  headers: Headers
  expiresAt: number
}

const publicPath =
  /^\/(?:about|articles(?:\/[^/]+)?|tags(?:\/[^/]+)?|categories(?:\/[^/]+)?)?\/?$/

function cacheKey(request: Request) {
  const url = new URL(request.url)
  if (
    request.method !== "GET" ||
    url.search ||
    !publicPath.test(url.pathname) ||
    request.headers.has("authorization") ||
    request.headers.has("range") ||
    /\bno-(?:cache|store)\b/i.test(
      request.headers.get("cache-control") ?? ""
    ) ||
    /\bno-cache\b/i.test(request.headers.get("pragma") ?? "")
  )
    return null

  // Only engagement APIs read this visitor ID. All other cookies, including
  // chunked or future session cookies, conservatively bypass shared HTML.
  const cookies = (request.headers.get("cookie") ?? "").split(";")
  if (
    cookies.some((cookie) => {
      const name = cookie.split("=", 1)[0].trim()
      return name && name !== "level_insouciant_behavior_id"
    })
  )
    return null

  return url.origin + url.pathname
}

/** Anonymous HTML only. Browser/CDN caching stays disabled so writes take effect immediately. */
export class PublicPageCache {
  private pages = new Map<string, CachedPage>()
  private bytes = 0
  private generation = 0
  private ttlMs: number
  private maxEntries: number
  private maxBytes: number
  private maxEntryBytes: number

  constructor(options: CacheOptions = {}) {
    this.ttlMs = options.ttlMs ?? 60_000
    this.maxEntries = options.maxEntries ?? 64
    this.maxBytes = options.maxBytes ?? 16 * 1024 * 1024
    this.maxEntryBytes = Math.min(
      options.maxEntryBytes ?? 2 * 1024 * 1024,
      this.maxBytes
    )
  }

  clear() {
    this.generation++
    this.pages.clear()
    this.bytes = 0
  }

  private remove(key: string) {
    const page = this.pages.get(key)
    if (page) {
      this.bytes -= page.body.byteLength
      this.pages.delete(key)
    }
  }

  private store(key: string, body: Uint8Array, headers: Headers) {
    this.remove(key)
    while (
      this.pages.size >= this.maxEntries ||
      this.bytes + body.byteLength > this.maxBytes
    ) {
      this.remove(this.pages.keys().next().value!)
    }
    this.pages.set(key, { body, headers, expiresAt: Date.now() + this.ttlMs })
    this.bytes += body.byteLength
  }

  async respond(
    request: Request,
    render: () => Promise<Response>
  ): Promise<Response> {
    const key = cacheKey(request)
    if (!key) return render()

    const cached = this.pages.get(key)
    if (cached && cached.expiresAt > Date.now()) {
      this.pages.delete(key)
      this.pages.set(key, cached)
      const headers = new Headers(cached.headers)
      headers.set("x-page-cache", "HIT")
      return new Response(cached.body.slice(), { headers })
    }
    this.remove(key)

    const generation = this.generation
    const response = await render()
    if (
      response.status !== 200 ||
      !response.body ||
      !/^text\/html(?:;|$)/i.test(response.headers.get("content-type") ?? "") ||
      response.headers.has("set-cookie") ||
      response.headers.has("vary")
    )
      return response

    const headers = new Headers(response.headers)
    headers.set("x-page-cache", "MISS")
    let chunks: Uint8Array[] = []
    let bytes = 0
    const body = response.body.pipeThrough(
      new TransformStream<Uint8Array, Uint8Array>({
        transform: (chunk, controller) => {
          bytes += chunk.byteLength
          if (bytes <= this.maxEntryBytes) chunks.push(chunk.slice())
          else chunks = []
          controller.enqueue(chunk)
        },
        flush: () => {
          // Do not restore old HTML after a content write or retain large pages.
          if (generation !== this.generation || bytes > this.maxEntryBytes)
            return
          const complete = new Uint8Array(bytes)
          let offset = 0
          for (const chunk of chunks) {
            complete.set(chunk, offset)
            offset += chunk.byteLength
          }
          this.store(key, complete, headers)
        },
      })
    )
    return new Response(body, { headers })
  }
}

export const publicPageCache = new PublicPageCache()

export function invalidatePublicPages() {
  publicPageCache.clear()
}
