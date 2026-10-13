import type { Metadata } from "@/types/seo"
import { getAllArticles } from "@/lib/content"
import { createPageMetadata } from "@/lib/seo"
import { getSiteConfig } from "@/lib/site-config"

export async function load() {
  const articles = await getAllArticles()

  return { articles }
}
export async function generateMetadata(): Promise<Metadata> {
  const siteConfig = await getSiteConfig()

  return createPageMetadata(
    {
      title: "层级档案",
      description: "浏览所有已公开的层级记录、观察笔记与世界观档案。",
      path: "/articles",
    },
    siteConfig
  )
}
