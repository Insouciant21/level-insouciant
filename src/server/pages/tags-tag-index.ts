import type { Metadata } from "@/types/seo"
import { notFound } from "@/server/request-context"
import { getArticlesByTag } from "@/lib/content"
import { createPageMetadata } from "@/lib/seo"
import { getSiteConfig } from "@/lib/site-config"
type TagPageProps = {
  params: Promise<{
    tag: string
  }>
}
export async function load({ params }: TagPageProps) {
  const { tag } = await params
  const archive = await getArticlesByTag(tag)

  if (!archive) {
    notFound()
  }

  return { archive }
}
export async function generateMetadata({
  params,
}: TagPageProps): Promise<Metadata> {
  const { tag } = await params
  const [archive, siteConfig] = await Promise.all([
    getArticlesByTag(tag),
    getSiteConfig(),
  ])

  if (!archive) {
    return createPageMetadata(
      {
        title: "标签不存在",
        description: "请求的标签不存在。",
        path: `/tags/${tag}`,
      },
      siteConfig
    )
  }

  return createPageMetadata(
    {
      title: `标签: ${archive.name}`,
      description: `${archive.name} 标签下的档案归档。`,
      path: `/tags/${tag}`,
    },
    siteConfig
  )
}
