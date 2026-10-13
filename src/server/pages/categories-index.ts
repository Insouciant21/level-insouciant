import type { Metadata } from "@/types/seo"
import { getAllCategories } from "@/lib/content"
import { createPageMetadata } from "@/lib/seo"
import { getSiteConfig } from "@/lib/site-config"

export async function load() {
  const categories = await getAllCategories()

  return { categories }
}
export async function generateMetadata(): Promise<Metadata> {
  const siteConfig = await getSiteConfig()

  return createPageMetadata(
    {
      title: "分类",
      description: "按内容类型查看文章归档。",
      path: "/categories",
    },
    siteConfig
  )
}
