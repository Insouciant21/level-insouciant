import type { Metadata } from "next"

import { createArticleAction } from "@/app/admin/actions"
import { AdminArticleEditorForm } from "@/components/admin/admin-article-editor-form"
import { createPageMetadata } from "@/lib/seo"
import { getSiteConfig } from "@/lib/site-config"

type AdminNewArticlePageProps = {
  searchParams: Promise<{
    error?: string
  }>
}

const errorMessages: Record<string, string> = {
  ARTICLE_SLUG_TAKEN: "这个 slug 已经存在了，请换一个新的。",
  ARTICLE_IMAGE_ALT_REQUIRED: "请为正文中的每张图片填写 alt 文本后再保存。",
  INVALID_ARTICLE_INPUT: "文章信息不完整，请补全标题、摘要、分类、标签、发布日期和正文。",
  MEDIA_REQUEST_FAILED: "媒体操作失败，请稍后重试。",
  MEDIA_STORAGE_NOT_CONFIGURED: "图片存储尚未配置，请联系管理员。",
}

export async function generateMetadata(): Promise<Metadata> {
  const siteConfig = await getSiteConfig()

  return createPageMetadata(
    {
      title: "新建文章",
      description: "管理员在线创建新文章。",
      path: "/admin/articles/new",
      noIndex: true,
    },
    siteConfig
  )
}

export default async function AdminNewArticlePage({ searchParams }: AdminNewArticlePageProps) {
  const params = await searchParams
  const message = params.error ? errorMessages[params.error] ?? "创建失败，请稍后再试。" : null

  return (
    <AdminArticleEditorForm
      mode="create"
      action={createArticleAction}
      values={{
        slug: "",
        title: "",
        desc: "",
        category: "",
        tags: "",
        cover: "",
        publishedAt: new Date().toISOString().slice(0, 10),
        content: "",
      }}
      statusLabel="新文章 / 未发布"
      message={message}
    />
  )
}
