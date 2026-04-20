import type { Metadata } from "next"
import Link from "next/link"

import { ArticleCard } from "@/components/blog/article-card"
import { EmptyState } from "@/components/blog/empty-state"
import { HomeDoorGrid } from "@/components/blog/home-door-grid"
import { HomeHero } from "@/components/blog/home-hero"
import { HomeProfileCard } from "@/components/blog/home-profile-card"
import { HomeTagCloud } from "@/components/blog/home-tag-cloud"
import { HomeTimeline } from "@/components/blog/home-timeline"
import { PageShell } from "@/components/blog/page-shell"
import { Button } from "@/components/ui/button"
import { getAllArticles, getArchiveOverview, getFeaturedArticles } from "@/lib/content"
import { createPageMetadata } from "@/lib/seo"
import { siteConfig } from "@/lib/site"

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
  const doorArticles = allArticles.slice(0, 6)

  const heroStats = [
    { label: "公开记录", value: String(allArticles.length).padStart(2, "0") },
    { label: "关键词索引", value: String(archiveOverview.tags.length).padStart(2, "0") },
    { label: "分类层级", value: String(archiveOverview.categories.length).padStart(2, "0") },
  ]

  return (
    <PageShell className="gap-12 lg:gap-16">
      <HomeHero
        eyebrow={siteConfig.hero.eyebrow}
        title={siteConfig.hero.title}
        description={siteConfig.hero.description}
        note={siteConfig.hero.note}
        primaryAction={siteConfig.hero.primaryAction}
        secondaryAction={siteConfig.hero.secondaryAction}
        stats={heroStats}
      />

      <section className="grid gap-6">
        <div className="max-w-3xl border-l-[3px] border-foreground/18 pl-5">
          <p className="utility-kicker">Facility Hub // Entry Node</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            入口不像首页，更像一段分叉走廊。
          </h2>
          <p className="mt-4 text-sm leading-8 text-muted-foreground sm:text-base">
            最新档案被重新布置成门、封存面板和可进入的通道。你不需要先看完整列表，可以先凭直觉挑一扇门，然后继续向里走。
          </p>
        </div>

        {doorArticles.length > 0 ? (
          <HomeDoorGrid articles={doorArticles} />
        ) : (
          <EmptyState
            title="档案仍在整理中"
            description="当前还没有公开记录，等第一批层级笔记整理完再开放。"
          />
        )}
      </section>

      <section className="grid gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-3xl">
            <p className="utility-kicker">Archive Index</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">最新档案</h2>
            <p className="mt-4 text-sm leading-8 text-muted-foreground sm:text-base">
              如果你更习惯传统列表，也可以从这里按条目继续浏览。首页的门板负责气氛，这一段负责把公开记录讲清楚。
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="chrome-pill">{allArticles.length} 条公开记录</span>
            <Button asChild variant="outline" size="sm">
              <Link href="/articles">查看全部档案</Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {featuredArticles.length > 0 ? (
            featuredArticles.map((article) => <ArticleCard key={article.slug} article={article} />)
          ) : null}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
        <HomeTimeline articles={allArticles} />

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-1">
          <HomeTagCloud items={archiveOverview.tags} />
          <HomeProfileCard
            title={siteConfig.profile.title}
            summary={siteConfig.profile.summary}
            status={siteConfig.profile.status}
            location={siteConfig.profile.location}
            focuses={siteConfig.profile.focuses}
            email={siteConfig.email}
          />
        </div>
      </section>
    </PageShell>
  )
}
