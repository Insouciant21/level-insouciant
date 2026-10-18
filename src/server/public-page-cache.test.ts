import { afterEach, describe, expect, it, vi } from "vitest"

import { PublicPageCache } from "./public-page-cache"

const request = (path = "/articles/example", init?: RequestInit) =>
  new Request(`https://blog.moeblue.top${path}`, init)

function html(body = "public article", headers?: HeadersInit) {
  return new Response(body, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "private, no-store",
      ...headers,
    },
  })
}

afterEach(() => vi.useRealTimers())

describe("public page cache", () => {
  it("reuses anonymous HTML, including visits with only the engagement cookie", async () => {
    const cache = new PublicPageCache()
    const render = vi.fn(async () => html())
    const first = await cache.respond(request(), render)
    expect(first.headers.get("x-page-cache")).toBe("MISS")
    expect(await first.text()).toBe("public article")

    const hit = await cache.respond(
      request(undefined, {
        headers: { cookie: "level_insouciant_behavior_id=reader" },
      }),
      render
    )
    expect(hit.headers.get("x-page-cache")).toBe("HIT")
    expect(hit.headers.get("cache-control")).toBe("private, no-store")
    expect(await hit.text()).toBe("public article")
    expect(render).toHaveBeenCalledTimes(1)
  })

  it("never reads or writes shared HTML for sessions or other credentials", async () => {
    const cache = new PublicPageCache()
    await (await cache.respond(request(), async () => html())).text()

    const credentials: HeadersInit[] = [
      { cookie: "astro-auth.session-token=alice" },
      { cookie: "astro-auth.session-token.0=chunk" },
      { cookie: "__Secure-authjs.session-token=bob" },
      {
        cookie:
          "level_insouciant_behavior_id=reader; astro-auth.session-token=alice",
      },
      { cookie: "future_session=unknown" },
      { authorization: "Bearer secret" },
    ]
    for (const headers of credentials) {
      const render = vi.fn(async () => html("Alice's account"))
      for (let i = 0; i < 2; i++) {
        const response = await cache.respond(
          request(undefined, { headers }),
          render
        )
        expect(response.headers.has("x-page-cache")).toBe(false)
        expect(await response.text()).toBe("Alice's account")
      }
      expect(render).toHaveBeenCalledTimes(2)
    }

    const anonymous = await cache.respond(request(), async () =>
      html("unexpected")
    )
    expect(await anonymous.text()).toBe("public article")
  })

  it("limits caching to plain GETs of known public pages", async () => {
    const cache = new PublicPageCache()
    for (const input of [
      request("/admin/articles"),
      request("/account"),
      request("/login"),
      request("/search?q=private"),
      request("/api/articles/example/engagement"),
      request("/articles/example/history"),
      request("/articles?category=Notes"),
      request("/articles/example?_action=publishArticleAction"),
      request(undefined, { method: "POST" }),
      request(undefined, { method: "HEAD" }),
      request(undefined, { headers: { range: "bytes=0-10" } }),
      request(undefined, { headers: { "cache-control": "no-cache" } }),
      request(undefined, { headers: { "cache-control": "no-store" } }),
      request(undefined, { headers: { pragma: "no-cache" } }),
    ]) {
      const render = vi.fn(async () => html())
      await (await cache.respond(input, render)).text()
      const second = await cache.respond(input, render)
      expect(second.headers.has("x-page-cache")).toBe(false)
      await second.text()
      expect(render).toHaveBeenCalledTimes(2)
    }
  })

  it("keeps URLs on different origins separate", async () => {
    const cache = new PublicPageCache()
    await (
      await cache.respond(request(), async () => html("production"))
    ).text()
    const other = await cache.respond(
      new Request("http://localhost/articles/example"),
      async () => html("local")
    )
    expect(other.headers.get("x-page-cache")).toBe("MISS")
    expect(await other.text()).toBe("local")
  })

  it("does not cache errors, cookies, varying responses, or non-HTML", async () => {
    const cache = new PublicPageCache()
    for (const render of [
      () =>
        new Response("not found", {
          status: 404,
          headers: { "content-type": "text/html" },
        }),
      () =>
        new Response("error", {
          status: 500,
          headers: { "content-type": "text/html" },
        }),
      () => Response.redirect("https://blog.moeblue.top/login"),
      () => Response.json({ private: true }),
      () => html("personal", { "set-cookie": "session=secret" }),
      () => html("varying", { vary: "Cookie" }),
      () => html("varying", { vary: "Accept-Language" }),
    ]) {
      const next = vi.fn(async () => render())
      await (await cache.respond(request(), next)).text()
      const response = await cache.respond(request(), next)
      expect(response.headers.has("x-page-cache")).toBe(false)
      await response.text()
      expect(next).toHaveBeenCalledTimes(2)
    }
  })

  it("streams the first response and stores it only when it completes", async () => {
    const cache = new PublicPageCache()
    let controller!: ReadableStreamDefaultController<Uint8Array>
    const response = await cache.respond(
      request(),
      async () =>
        new Response(
          new ReadableStream<Uint8Array>({
            start(value) {
              controller = value
            },
          }),
          { headers: { "content-type": "text/html" } }
        )
    )
    const reader = response.body!.getReader()
    controller.enqueue(new TextEncoder().encode("first"))
    expect(new TextDecoder().decode((await reader.read()).value)).toBe("first")
    controller.enqueue(new TextEncoder().encode("second"))
    controller.close()
    expect(new TextDecoder().decode((await reader.read()).value)).toBe("second")
    expect((await reader.read()).done).toBe(true)
    const hit = await cache.respond(request(), async () => html("unexpected"))
    expect(hit.headers.get("x-page-cache")).toBe("HIT")
    expect(await hit.text()).toBe("firstsecond")
  })

  it("does not repopulate invalidated pages from an older in-flight render", async () => {
    const cache = new PublicPageCache()
    let finish!: (response: Response) => void
    const pending = cache.respond(
      request(),
      () =>
        new Promise<Response>((resolve) => {
          finish = resolve
        })
    )
    cache.clear()
    finish(html("old published article"))
    expect(await (await pending).text()).toBe("old published article")
    const fresh = await cache.respond(request(), async () =>
      html("updated article")
    )
    expect(fresh.headers.get("x-page-cache")).toBe("MISS")
    expect(await fresh.text()).toBe("updated article")
  })

  it("expires cached pages and clears all public routes together", async () => {
    vi.useFakeTimers()
    const cache = new PublicPageCache({ ttlMs: 1000 })
    const render = vi.fn(async () => html())
    await (await cache.respond(request(), render)).text()
    await (await cache.respond(request("/"), render)).text()
    vi.advanceTimersByTime(1001)
    const expired = await cache.respond(request(), render)
    expect(expired.headers.get("x-page-cache")).toBe("MISS")
    await expired.text()
    cache.clear()
    const invalidated = await cache.respond(request("/"), render)
    expect(invalidated.headers.get("x-page-cache")).toBe("MISS")
    await invalidated.text()
  })

  it("evicts the least recently used page when the entry limit is reached", async () => {
    const cache = new PublicPageCache({ maxEntries: 2 })
    const render = async () => html()
    for (const path of [
      "/articles/first",
      "/articles/second",
      "/articles/first",
      "/articles/third",
    ]) {
      await (await cache.respond(request(path), render)).text()
    }
    const evicted = await cache.respond(request("/articles/second"), render)
    expect(evicted.headers.get("x-page-cache")).toBe("MISS")
    await evicted.text()
  })

  it("bounds cached bytes and declines oversized pages", async () => {
    const cache = new PublicPageCache({ maxBytes: 6, maxEntryBytes: 4 })
    const render = async () => html("abc")
    for (const path of [
      "/articles/first",
      "/articles/second",
      "/articles/third",
    ]) {
      await (await cache.respond(request(path), render)).text()
    }
    const evicted = await cache.respond(request("/articles/first"), render)
    expect(evicted.headers.get("x-page-cache")).toBe("MISS")
    await evicted.text()
    for (let i = 0; i < 2; i++) {
      const oversized = await cache.respond(
        request("/articles/large"),
        async () => html("large page")
      )
      expect(oversized.headers.get("x-page-cache")).toBe("MISS")
      expect(await oversized.text()).toBe("large page")
    }
  })
})
