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
  INVALID_ARTICLE_INPUT: "文章信息不完整，请补全标题、摘要、分类、标签、发布日期和正文。",
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
