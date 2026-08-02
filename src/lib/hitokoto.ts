const hitokotoCategories = ["a", "b", "c", "d", "e", "i"] as const

const fallbackQuotes = [
  "先整理命名、边界和证据，再决定是否继续深入。",
  "记录那些会重复出现的结构，路径才不会只依赖记忆。",
  "给后来抵达的人留下足够诚实的说明，而不是夸张的传奇。",
] as const

type HitokotoResponse = {
  hitokoto?: unknown
}

function createHitokotoUrl(slot: number) {
  const url = new URL("https://v1.hitokoto.cn/")

  for (const category of hitokotoCategories) {
    url.searchParams.append("c", category)
  }

  url.searchParams.set("encode", "json")
  url.searchParams.set("min_length", String(slot))
  url.searchParams.set("max_length", "80")

  return url.toString()
}

async function fetchHitokoto(slot: number) {
  try {
    const response = await fetch(createHitokotoUrl(slot), {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(4000),
    })

    if (!response.ok) {
      return null
    }

    const data = (await response.json()) as HitokotoResponse

    return typeof data.hitokoto === "string" && data.hitokoto.trim()
      ? data.hitokoto.trim()
      : null
  } catch {
    return null
  }
}

async function getHitokotoQuotes(count = 3) {
  const quotes: Array<string | null> = []

  for (let slot = 0; slot < count; slot += 1) {
    quotes.push(await fetchHitokoto(slot))

    if (slot < count - 1) {
      await new Promise((resolve) => setTimeout(resolve, 550))
    }
  }

  return quotes.map(
    (quote, index) => quote ?? fallbackQuotes[index % fallbackQuotes.length]
  )
}

export { getHitokotoQuotes }
