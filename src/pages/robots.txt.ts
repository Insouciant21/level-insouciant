import { getSiteConfig } from "@/lib/site-config"
import { absoluteUrl } from "@/lib/seo"
export async function GET() {
  const config = await getSiteConfig()
  return new Response(
    `User-agent: *\nAllow: /\nSitemap: ${absoluteUrl("/sitemap.xml", config)}\nHost: ${absoluteUrl("/", config)}\n`,
    {
      headers: {
        "content-type": "text/plain; charset=utf-8",
        "cache-control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    }
  )
}
