import sitemap from "@/server/sitemap"
export async function GET() {
  const entries = await sitemap()
  const escape = (s: string) =>
    s
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries.map((entry) => `<url><loc>${escape(entry.url)}</loc>${entry.lastModified ? `<lastmod>${entry.lastModified.toISOString()}</lastmod>` : ""}<changefreq>${entry.changeFrequency}</changefreq><priority>${entry.priority}</priority></url>`).join("")}</urlset>`,
    {
      headers: {
        "content-type": "application/xml; charset=utf-8",
        "cache-control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    }
  )
}
