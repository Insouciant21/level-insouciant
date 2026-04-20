import type { Metadata } from "next"
import dynamic from "next/dynamic"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"

import { ArticleCard } from "@/components/blog/article-card"
import { ArticlePaginationNav } from "@/components/blog/article-pagination-nav"
import { ArticleTableOfContents } from "@/components/blog/article-table-of-contents"
import { ContentProse } from "@/components/blog/content-prose"
import { MotionReveal } from "@/components/motion/page-transition"
import { PageShell } from "@/components/blog/page-shell"
import { ArticleEngagementPanelSkeleton } from "@/components/blog/page-skeletons"
import { ReadingProgressBar } from "@/components/blog/reading-progress-bar"
import { TagList } from "@/components/blog/tag-list"
import { getArchiveSignal } from "@/lib/archive-presentation"
import {
  getAllArticles,
  getArticleBySlug,
  getArticlePagination,
  getRelatedArticles,
} from "@/lib/content"
import { formatDisplayDate } from "@/lib/content"
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
  const signal = getArchiveSignal(article)

  return (
    <PageShell>
      <ReadingProgressBar targetId="article-reading-root" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: createArticleJsonLd(article) }}
      />
      <div className="mx-auto grid w-full max-w-7xl gap-6 md:gap-8 xl:grid-cols-[minmax(0,1fr)_300px] xl:items-start">
        <MotionReveal variant="left">
          <article id="article-reading-root" className="min-w-0">
            <div className="dossier-paper mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 sm:py-8 md:px-12">
              <Link
                href="/articles"
                className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.22em] text-muted-foreground transition hover:text-foreground"
              >
                <ArrowLeft className="size-4" />
                返回档案索引
              </Link>

              <header className="mt-6 border-b-4 border-foreground pb-8">
                <div className="flex flex-wrap items-center justify-between gap-4 text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                  <span>Archive File // {signal.designation}</span>
                  <span>{formatDisplayDate(article.date)}</span>
                </div>

                <h1 className="mt-5 break-words text-3xl font-semibold leading-[0.95] tracking-tight text-balance sm:text-4xl md:text-6xl">
                  {article.title}
                </h1>
                <p className="mt-5 max-w-3xl text-base leading-8 text-foreground/78 md:text-lg">
                  {article.desc}
                </p>

                <div className="mt-6 flex flex-wrap gap-3 text-[0.72rem] font-semibold uppercase tracking-[0.26em]">
                  <span className="bg-[#171613] px-3 py-1.5 text-[#f3efe2]">Code: {signal.designation}</span>
                  <span className="border border-border/80 bg-background/80 px-3 py-1.5 text-muted-foreground">
                    Category: {article.category}
                  </span>
                </div>

                <div className="mt-6">
                  <TagList tags={article.tags} />
                </div>
              </header>

              {article.cover ? (
                <div className="mt-8 overflow-hidden border-[4px] border-black/10 bg-[#b8b0a2]">
                  <Image
                    src={article.cover}
                    alt={article.title}
                    width={1600}
                    height={880}
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 80vw, 896px"
                    className="h-[14rem] w-full object-cover grayscale-[0.15] sepia-[0.22] sm:h-[18rem] md:h-[22rem]"
                  />
                </div>
              ) : null}

              <ArticleTableOfContents items={tocItems} className="mt-8 xl:hidden" />

              <div className="mt-10">
                <ContentProse source={article.content} />
              </div>
            </div>
          </article>
        </MotionReveal>

        <aside className="hidden xl:sticky xl:top-32 xl:grid xl:self-start">
          <MotionReveal variant="right" delay={0.3}>
            <ArticleTableOfContents
              items={tocItems}
              className="xl:max-h-[calc(100svh-9rem)] xl:overflow-y-auto"
            />
          </MotionReveal>
        </aside>
      </div>

      <MotionReveal delay={0.2}>
        <ArticleEngagementPanel slug={article.slug} />
      </MotionReveal>

      <MotionReveal delay={0.25}>
        <ArticlePaginationNav previous={pagination?.previous ?? null} next={pagination?.next ?? null} />
      </MotionReveal>

      {relatedArticles.length > 0 ? (
        <MotionReveal delay={0.3}>
          <section className="grid gap-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-xl font-semibold tracking-tight">相关文章</h2>
              <p className="text-sm text-muted-foreground">根据标签与分类自动关联</p>
            </div>
            {relatedArticles.map((entry) => (
              <ArticleCard key={entry.slug} article={entry} />
            ))}
          </section>
        </MotionReveal>
      ) : null}
    </PageShell>
  )
}
