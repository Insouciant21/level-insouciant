import { getAllArticles } from "@/lib/content"
import { buildRssXml } from "@/lib/seo"
import { getSiteConfig } from "@/lib/site-config"

export async function GET() {
  const [articles, siteConfig] = await Promise.all([
    getAllArticles(),
    getSiteConfig(),
  ])
  const xml = buildRssXml(articles, siteConfig)

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  })
}
