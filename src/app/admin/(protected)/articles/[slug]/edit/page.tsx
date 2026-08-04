import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { updateArticleAction } from "@/app/admin/actions"
import { AdminArticleEditorForm } from "@/components/admin/admin-article-editor-form"
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

const errorMessages: Record<string, string> = {
  ARTICLE_NOT_FOUND: "没有找到这篇文章。",
  ARTICLE_IMAGE_ALT_REQUIRED: "请为正文中的每张图片填写 alt 文本后再保存。",
  INVALID_ARTICLE_INPUT: "文章信息不完整，请把必填内容补全后再保存。",
  MEDIA_REQUEST_FAILED: "媒体操作失败，请稍后重试。",
  MEDIA_STORAGE_NOT_CONFIGURED: "图片存储尚未配置，请联系管理员。",
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

function getPageMessage(params: Awaited<AdminEditArticlePageProps["searchParams"]>) {
  if (params.created) {
    return "文章已经创建完成，现在可以继续补充内容或再次发布。"
  }

  if (params.saved) {
    return "文章已保存，并生成了一条新的修订记录。"
  }

  if (params.error) {
    return errorMessages[params.error] ?? "保存失败，请稍后再试。"
  }

  return null
}

export default async function AdminEditArticlePage({ params, searchParams }: AdminEditArticlePageProps) {
  const [{ slug }, query] = await Promise.all([params, searchParams])
  const article = await getManagedArticleBySlug(slug)

  if (!article) {
    notFound()
  }

  return (
    <AdminArticleEditorForm
      mode="edit"
      action={updateArticleAction}
      values={{
        slug: article.slug,
        title: article.title,
        desc: article.desc,
        category: article.category,
        tags: article.tags.join(", "),
        cover: article.cover ?? "",
        publishedAt: article.date.slice(0, 10),
        content: article.content,
      }}
      statusLabel={article.draft ? "草稿 / 已隐藏" : "已发布"}
      lastEditedByName={article.lastEditedByName}
      historyHref={`/admin/articles/${article.slug}/history`}
      previewHref={article.draft ? null : `/articles/${article.slug}`}
      message={getPageMessage(query)}
    />
  )
}
