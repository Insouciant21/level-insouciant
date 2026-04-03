import { getAllArticles } from "@/lib/content"
import { buildRssXml } from "@/lib/seo"

export async function GET() {
  const articles = await getAllArticles()
  const xml = buildRssXml(articles)

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  })
}
