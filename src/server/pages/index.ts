import type { Metadata } from "@/types/seo"
import { getAllArticles, getArchiveOverview } from "@/lib/content"
import { getHitokotoQuotes } from "@/lib/hitokoto"
import { createPageMetadata } from "@/lib/seo"
import { getSiteConfig } from "@/lib/site-config"

export async function load() {
  const [siteConfig, archiveOverview, allArticles, hitokotoQuotes] =
    await Promise.all([
      getSiteConfig(),
      getArchiveOverview(),
      getAllArticles(),
      getHitokotoQuotes(),
    ])
  const doorArticles = allArticles.slice(0, 6)

  return {
    siteConfig,
    archiveOverview,
    allArticles,
    hitokotoQuotes,
    doorArticles,
  }
}
export async function generateMetadata(): Promise<Metadata> {
  const siteConfig = await getSiteConfig()

  return {
    ...createPageMetadata(
      {
        title: siteConfig.name,
        description: siteConfig.description,
        path: "/",
      },
      siteConfig
    ),
    title: {
      absolute: siteConfig.name,
    },
  }
}
