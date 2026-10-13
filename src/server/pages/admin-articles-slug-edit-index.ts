import type { Metadata } from "@/types/seo"
import { notFound } from "@/server/request-context"
import { getManagedArticleBySlug } from "@/lib/content-admin"
import { createPageMetadata } from "@/lib/seo"
import { getSiteConfig } from "@/lib/site-config"
type AdminEditArticlePageProps = {
  params: Promise<{
    slug: string
  }>
  searchParams: Promise<{
    created?: string
    saved?: string
    error?: string
  }>
}
export async function load({
  params,
  searchParams,
}: AdminEditArticlePageProps) {
  const [{ slug }, query] = await Promise.all([params, searchParams])
  const article = await getManagedArticleBySlug(slug)

  if (!article) {
    notFound()
  }

  return { slug, query, article }
}
export async function generateMetadata(): Promise<Metadata> {
  const siteConfig = await getSiteConfig()

  return createPageMetadata(
    {
      title: "编辑文章",
      description: "管理员在线编辑文章。",
      path: "/admin/articles",
      noIndex: true,
    },
    siteConfig
  )
}
