import { searchArticles } from "@/lib/content"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q")?.trim() ?? ""

  if (!query) {
    return Response.json({ results: [] })
  }

  try {
    const results = await searchArticles(query)
    return Response.json({ results })
  } catch {
    return Response.json({ error: "SEARCH_FAILED" }, { status: 500 })
  }
}
