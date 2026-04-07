import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { ArticleCard } from "@/components/blog/article-card"
import { PageIntro } from "@/components/blog/page-intro"
import { PageShell } from "@/components/blog/page-shell"
import { getAllCategories, getArticlesByCategory } from "@/lib/content"
import { createPageMetadata } from "@/lib/seo"

type CategoryPageProps = {
  params: Promise<{
    category: string
  }>
}

export async function generateStaticParams() {
  const categories = await getAllCategories()
  return categories.map((category) => ({
    category: category.slug,
  }))
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category } = await params
  const archive = await getArticlesByCategory(category)

  if (!archive) {
    return createPageMetadata({
      title: "分类不存在",
      description: "请求的分类不存在。",
      path: `/categories/${category}`,
    })
  }

  return createPageMetadata({
    title: `分类: ${archive.name}`,
    description: `${archive.name} 分类下的档案归档。`,
    path: `/categories/${category}`,
  })
}

export default async function CategoryDetailPage({ params }: CategoryPageProps) {
  const { category } = await params
  const archive = await getArticlesByCategory(category)

  if (!archive) {
    notFound()
  }

  return (
    <PageShell>
      <PageIntro
        eyebrow="Category"
        title={archive.name}
        description={`这里收录所有属于“${archive.name}”分类的公开档案。`}
      />
      <section className="grid gap-5">
        {archive.articles.map((article) => (
          <ArticleCard key={article.slug} article={article} />
        ))}
      </section>
    </PageShell>
  )
}
