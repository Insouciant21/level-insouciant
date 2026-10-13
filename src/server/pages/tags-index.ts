import type { Metadata } from "@/types/seo"
import { getTagAggregates } from "@/lib/content"
import { createPageMetadata } from "@/lib/seo"
import { getSiteConfig } from "@/lib/site-config"

export async function load() {
  const tags = await getTagAggregates()

  return { tags }
}
export async function generateMetadata(): Promise<Metadata> {
  const siteConfig = await getSiteConfig()

  return createPageMetadata(
    {
      title: "标签",
      description: "按主题查看文章归档。",
      path: "/tags",
    },
    siteConfig
  )
}
