import type { Metadata } from "@/types/seo"
import { notFound } from "@/server/request-context"
import { getArticlesByCategory } from "@/lib/content"
import { createPageMetadata } from "@/lib/seo"
import { getSiteConfig } from "@/lib/site-config"
type CategoryPageProps = {
  params: Promise<{
    category: string
  }>
}
export async function load({ params }: CategoryPageProps) {
  const { category } = await params
  const archive = await getArticlesByCategory(category)

  if (!archive) {
    notFound()
  }

  return { archive }
}
export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { category } = await params
  const [archive, siteConfig] = await Promise.all([
    getArticlesByCategory(category),
    getSiteConfig(),
  ])

  if (!archive) {
    return createPageMetadata(
      {
        title: "分类不存在",
        description: "请求的分类不存在。",
        path: `/categories/${category}`,
      },
      siteConfig
    )
  }

  return createPageMetadata(
    {
      title: `分类: ${archive.name}`,
      description: `${archive.name} 分类下的档案归档。`,
      path: `/categories/${category}`,
    },
    siteConfig
  )
}
