import type { Metadata } from "next"
import dynamic from "next/dynamic"
import Link from "next/link"
import { notFound } from "next/navigation"

import { ArticleCard } from "@/components/blog/article-card"
import { ArticleMeta } from "@/components/blog/article-meta"
import { ArticlePaginationNav } from "@/components/blog/article-pagination-nav"
import { ArticleTableOfContents } from "@/components/blog/article-table-of-contents"
import { CategoryBadge } from "@/components/blog/category-badge"
import { ContentProse } from "@/components/blog/content-prose"
import { PageShell } from "@/components/blog/page-shell"
import { ArticleEngagementPanelSkeleton } from "@/components/blog/page-skeletons"
import { ReadingProgressBar } from "@/components/blog/reading-progress-bar"
import { TagList } from "@/components/blog/tag-list"
import {
  getAllArticles,
  getArticleBySlug,
  getArticlePagination,
  getRelatedArticles,
} from "@/lib/content"
import { createArticleJsonLd, createArticleMetadata, createPageMetadata } from "@/lib/seo"
import { extractTableOfContents } from "@/lib/toc"

const ArticleEngagementPanel = dynamic(
  () => import("@/components/blog/article-engagement-panel").then((module) => module.ArticleEngagementPanel),
  {
    loading: () => <ArticleEngagementPanelSkeleton />,
  }
)

type ArticlePageProps = {
  params: Promise<{
    slug: string
  }>
}

export async function generateStaticParams() {
  const articles = await getAllArticles()
  return articles.map((article) => ({
    slug: article.slug,
  }))
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params
  const article = await getArticleBySlug(slug)

  if (!article) {
    return createPageMetadata({
      title: "文章不存在",
      description: "请求的文章不存在。",
      path: `/articles/${slug}`,
    })
  }

  return createArticleMetadata(article)
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params
  const article = await getArticleBySlug(slug)

  if (!article) {
    notFound()
  }

  const [relatedArticles, pagination] = await Promise.all([
    getRelatedArticles(article),
    getArticlePagination(article.slug),
  ])
  const tocItems = extractTableOfContents(article.content)

  return (
    <PageShell>
      <ReadingProgressBar targetId="article-reading-root" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: createArticleJsonLd(article) }}
      />
      <div className="mx-auto grid w-full max-w-6xl gap-8 xl:grid-cols-[minmax(0,1fr)_260px] xl:items-start">
        <article id="article-reading-root" className="min-w-0">
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 xl:mx-0 xl:max-w-none">
            <Link href="/articles" className="text-sm text-muted-foreground transition hover:text-foreground">
              返回博客列表
            </Link>
            <header className="space-y-5 border-b border-border/60 pb-8">
              <CategoryBadge category={article.category} />
              <div className="space-y-3">
                <h1 className="text-3xl font-semibold tracking-tight text-balance md:text-5xl">
                  {article.title}
                </h1>
                <p className="text-base leading-7 text-muted-foreground md:text-lg">{article.desc}</p>
              </div>
              <ArticleMeta category={article.category} date={article.date} />
              <TagList tags={article.tags} />
            </header>
            <ArticleTableOfContents items={tocItems} className="xl:hidden" />
            <ContentProse source={article.content} />
          </div>
        </article>

        <aside className="hidden xl:block">
          <ArticleTableOfContents items={tocItems} className="sticky top-24" />
        </aside>
      </div>

      <ArticleEngagementPanel slug={article.slug} />

      <ArticlePaginationNav previous={pagination?.previous ?? null} next={pagination?.next ?? null} />

      {relatedArticles.length > 0 ? (
        <section className="grid gap-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold tracking-tight">相关文章</h2>
            <p className="text-sm text-muted-foreground">根据标签与分类自动关联</p>
          </div>
          {relatedArticles.map((entry) => (
            <ArticleCard key={entry.slug} article={entry} />
          ))}
        </section>
      ) : null}
    </PageShell>
  )
}
