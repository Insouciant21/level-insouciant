import type { Metadata } from "next"
import { ArticleCard } from "@/components/blog/article-card"
import { EmptyState } from "@/components/blog/empty-state"
import { HomeHero } from "@/components/blog/home-hero"
import { HomeProfileCard } from "@/components/blog/home-profile-card"
import { HomeTagCloud } from "@/components/blog/home-tag-cloud"
import { HomeTimeline } from "@/components/blog/home-timeline"
import { PageShell } from "@/components/blog/page-shell"
import { Button } from "@/components/ui/button"
import { getAllArticles, getArchiveOverview, getFeaturedArticles } from "@/lib/content"
import { createPageMetadata } from "@/lib/seo"
import { siteConfig } from "@/lib/site"
import Link from "next/link"

export const metadata: Metadata = {
  ...createPageMetadata({
    title: siteConfig.name,
    description: siteConfig.hero.description,
    path: "/",
  }),
  title: {
    absolute: siteConfig.name,
  },
}

export default async function Page() {
  const [featuredArticles, archiveOverview, allArticles] = await Promise.all([
    getFeaturedArticles(),
    getArchiveOverview(),
    getAllArticles(),
  ])

  const heroStats = [
    { label: "公开文章", value: String(allArticles.length).padStart(2, "0") },
    { label: "标签主题", value: String(archiveOverview.tags.length).padStart(2, "0") },
    { label: "内容分类", value: String(archiveOverview.categories.length).padStart(2, "0") },
  ]

  return (
    <PageShell className="gap-8">
      <HomeHero
        eyebrow={siteConfig.hero.eyebrow}
        title={siteConfig.hero.title}
        description={siteConfig.hero.description}
        note={siteConfig.hero.note}
        primaryAction={siteConfig.hero.primaryAction}
        secondaryAction={siteConfig.hero.secondaryAction}
        stats={heroStats}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.28fr)_minmax(320px,0.72fr)]">
        <section className="grid gap-5">
          <div className="surface-panel px-6 py-6 sm:px-7">
            <div className="flex flex-col gap-4 border-b border-border/60 pb-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Latest Posts
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">最新文章</h2>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  最近公开发布的内容，会优先展示在首页。
                </p>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-sm text-muted-foreground">{allArticles.length} 篇公开文章</p>
                <Button asChild variant="outline" size="sm" className="rounded-full">
                  <Link href="/articles">查看全部</Link>
                </Button>
              </div>
            </div>

            <div className="mt-6 grid gap-5">
              {featuredArticles.length > 0 ? (
                featuredArticles.map((article) => <ArticleCard key={article.slug} article={article} />)
              ) : (
                <EmptyState
                  title="文章还在整理中"
                  description="当前还没有公开文章，等我把第一批内容整理好再放出来。"
                />
              )}
            </div>
          </div>
        </section>

        <aside className="grid gap-6 sm:grid-cols-2 xl:grid-cols-1">
          <HomeTagCloud items={archiveOverview.tags} />
          <HomeTimeline articles={allArticles} />
          <HomeProfileCard
            title={siteConfig.profile.title}
            summary={siteConfig.profile.summary}
            status={siteConfig.profile.status}
            location={siteConfig.profile.location}
            focuses={siteConfig.profile.focuses}
            email={siteConfig.email}
          />
        </aside>
      </div>
    </PageShell>
  )
}
