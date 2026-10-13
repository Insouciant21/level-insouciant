import type { Metadata } from "@/types/seo"
import { createPageMetadata } from "@/lib/seo"
import { getSiteConfig } from "@/lib/site-config"

export async function load() {
  const siteConfig = await getSiteConfig()

  return { siteConfig }
}
export async function generateMetadata(): Promise<Metadata> {
  const siteConfig = await getSiteConfig()

  return createPageMetadata(
    {
      title: "站点设置",
      description: "编辑站点身份、页面内容、联系方式与页脚链接。",
      path: "/admin/settings",
      noIndex: true,
    },
    siteConfig
  )
}
