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
import { PerfectScrollbar } from "@/components/ui/perfect-scrollbar"
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
import {
  createArticleJsonLd,
  createArticleMetadata,
  createPageMetadata,
} from "@/lib/seo"
import { extractTableOfContents } from "@/lib/toc"

const ArticleEngagementPanel = dynamic(
  () =>
    import("@/components/blog/article-engagement-panel").then(
      (module) => module.ArticleEngagementPanel
    ),
  {
    loading: () => <ArticleEngagementPanelSkeleton />,
  }
)

const articleDocumentPanelClass =
  "public-summary-panel-document"
const articleHeaderBadgeClass =
  "public-summary-chip border-[#73766f]/55 bg-[#d9d1ad]/58 px-3 py-1.5 text-foreground shadow-[inset_0_1px_0_rgba(255,252,225,0.16)]"

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

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
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
      <div className="pointer-events-none fixed inset-0 opacity-[0.02]">
        <div className="h-full w-full bg-[radial-gradient(ellipse_at_top,#ffbf00_0%,transparent_60%)]" />
      </div>

      <div className="mx-auto grid w-full max-w-[1200px] gap-8 md:gap-12 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
        <MotionReveal variant="left">
          <article id="article-reading-root" className="min-w-0">
            <div
              className={`${articleDocumentPanelClass} mx-auto w-full max-w-4xl px-4 py-6 sm:px-8 sm:py-8 md:px-16 md:py-12`}
            >
              <Link
                href="/articles"
                className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.22em] text-muted-foreground transition duration-500 hover:text-foreground"
              >
                <ArrowLeft className="size-4" />
                返回档案索引
              </Link>

              <header className="mt-6 border-b border-[#181b17]/72 pb-8 shadow-[0_1px_0_rgba(255,252,225,0.14)]">
                <div className="flex flex-wrap items-center justify-between gap-4 text-[0.72rem] font-bold uppercase tracking-[0.28em] text-muted-foreground">
                  <span>M.E.G. Database // Archive File</span>
                  <span>{formatDisplayDate(article.date)}</span>
                </div>

                <h1 className="mt-5 break-words font-serif text-4xl font-bold leading-[0.95] tracking-tight text-foreground text-balance sm:text-5xl md:text-7xl">
                  {article.title}
                </h1>
                <p className="mt-5 max-w-3xl text-base leading-8 text-foreground/78 md:text-lg">
                  {article.desc}
                </p>

                <div className="mt-6 flex flex-wrap gap-3 text-[0.72rem] font-semibold uppercase tracking-[0.26em]">
                  <span className="border border-[#181b17] bg-[#181b17] px-3 py-1.5 text-[#d9d1ad]">
                    Code: {signal.designation}
                  </span>
                  <span className={articleHeaderBadgeClass}>
                    Category: {article.category}
                  </span>
                </div>

                <div className="mt-6">
                  <TagList tags={article.tags} />
                </div>
              </header>

              {article.cover ? (
                <div className="group relative mt-8 overflow-hidden rounded-md border border-[#73766f]/38 bg-[#c6bd99] grayscale-[0.24] sepia-[0.22] shadow-[inset_0_1px_0_rgba(255,252,225,0.14),0_18px_42px_-34px_rgba(0,0,0,0.34)]">
                  <Image
                    src={article.cover}
                    alt={article.title}
                    width={1600}
                    height={880}
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 80vw, 896px"
                    className="h-[14rem] w-full object-cover mix-blend-multiply opacity-85 transition duration-[3000ms] group-hover:scale-105 group-hover:opacity-100 sm:h-[18rem] md:h-[22rem]"
                  />
                </div>
              ) : null}

              <ArticleTableOfContents
                items={tocItems}
                className="mt-8 xl:hidden"
              />

              <div className="mt-10">
                <ContentProse source={article.content} />
              </div>
            </div>
          </article>
        </MotionReveal>

        <aside className="hidden xl:sticky xl:top-32 xl:grid xl:self-start">
          <MotionReveal variant="right" delay={0.3}>
            <PerfectScrollbar
              aria-label="文章目录"
              tabIndex={0}
              className="xl:max-h-[calc(100svh-9rem)]"
            >
              <ArticleTableOfContents items={tocItems} />
            </PerfectScrollbar>
          </MotionReveal>
        </aside>
      </div>

      <MotionReveal delay={0.2}>
        <ArticleEngagementPanel slug={article.slug} />
      </MotionReveal>

      <MotionReveal delay={0.25}>
        <ArticlePaginationNav
          previous={pagination?.previous ?? null}
          next={pagination?.next ?? null}
        />
      </MotionReveal>

      {relatedArticles.length > 0 ? (
        <MotionReveal delay={0.3}>
          <section className="grid gap-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-xl font-semibold tracking-tight">相关文章</h2>
              <p className="text-sm text-muted-foreground">
                根据标签与分类自动关联
              </p>
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
