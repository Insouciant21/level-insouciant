import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { ArticleCard } from "@/components/blog/article-card"
import { PageIntro } from "@/components/blog/page-intro"
import { PageShell } from "@/components/blog/page-shell"
import { getAllTags, getArticlesByTag } from "@/lib/content"
import { createPageMetadata } from "@/lib/seo"

type TagPageProps = {
  params: Promise<{
    tag: string
  }>
}

export async function generateStaticParams() {
  const tags = await getAllTags()
  return tags.map((tag) => ({
    tag: tag.slug,
  }))
}

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const { tag } = await params
  const archive = await getArticlesByTag(tag)

  if (!archive) {
    return createPageMetadata({
      title: "标签不存在",
      description: "请求的标签不存在。",
      path: `/tags/${tag}`,
    })
  }

  return createPageMetadata({
    title: `标签: ${archive.name}`,
    description: `${archive.name} 标签下的文章归档。`,
    path: `/tags/${tag}`,
  })
}

export default async function TagDetailPage({ params }: TagPageProps) {
  const { tag } = await params
  const archive = await getArticlesByTag(tag)

  if (!archive) {
    notFound()
  }

  return (
    <PageShell>
      <PageIntro
        eyebrow="Tag"
        title={archive.name}
        description={`这里收录所有和“${archive.name}”相关的公开文章。`}
      />
      <section className="grid gap-5">
        {archive.articles.map((article) => (
          <ArticleCard key={article.slug} article={article} />
        ))}
      </section>
    </PageShell>
  )
}
