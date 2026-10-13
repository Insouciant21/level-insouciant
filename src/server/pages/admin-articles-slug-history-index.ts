import type { Metadata } from "@/types/seo"
import { notFound } from "@/server/request-context"
import { getArticleRevisionHistory } from "@/lib/content-admin"
import { createPageMetadata } from "@/lib/seo"
import { getSiteConfig } from "@/lib/site-config"
type AdminArticleHistoryPageProps = {
  params: Promise<{
    slug: string
  }>
  searchParams: Promise<{
    restored?: string
    error?: string
  }>
}
function getPageMessage(
  params: Awaited<AdminArticleHistoryPageProps["searchParams"]>
) {
  if (params.restored) {
    return "历史版本已恢复，当前文章也同步生成了一条新的修订记录。"
  }

  if (params.error) {
    return errorMessages[params.error] ?? "恢复失败，请稍后再试。"
  }

  return null
}
const errorMessages: Record<string, string> = {
  ARTICLE_NOT_FOUND: "没有找到这篇文章。",
  REVISION_NOT_FOUND: "这条修订记录不存在，可能已经被删除。",
}
export async function load({
  params,
  searchParams,
}: AdminArticleHistoryPageProps) {
  const [{ slug }, query] = await Promise.all([params, searchParams])
  const history = await getArticleRevisionHistory(slug)

  if (!history) {
    notFound()
  }

  const { article, revisions } = history
  const message = getPageMessage(query)

  return { slug, article, revisions, message }
}
export async function generateMetadata(): Promise<Metadata> {
  const siteConfig = await getSiteConfig()

  return createPageMetadata(
    {
      title: "文章修订历史",
      description: "管理员查看并恢复文章历史版本。",
      path: "/admin/articles",
      noIndex: true,
    },
    siteConfig
  )
}
