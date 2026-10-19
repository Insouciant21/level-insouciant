import { EmptyState } from "@/components/blog/empty-state"
import { HomeDoorGrid } from "@/components/blog/home-door-grid"
import { HomeHero } from "@/components/blog/home-hero"
import { HomeProfileCard } from "@/components/blog/home-profile-card"
import { HomeTagCloud } from "@/components/blog/home-tag-cloud"
import { HomeTimeline } from "@/components/blog/home-timeline"
import { PageShell } from "@/components/blog/page-shell"

import type { load } from "@/server/pages/index"
import { IslandProvider } from "@/components/providers/island-provider"
function View({
  siteConfig,
  archiveOverview,
  allArticles,
  hitokotoQuotes,
  doorArticles,
}: Awaited<ReturnType<typeof load>>) {
  return (
    <PageShell className="gap-10 pt-8 sm:pt-10 lg:gap-12 lg:pt-10">
      <HomeHero title={siteConfig.hero.title} />

      <section>
        {doorArticles.length > 0 ? (
          <HomeDoorGrid articles={doorArticles} />
        ) : (
          <EmptyState
            title="档案仍在整理中"
            description="当前还没有公开记录，等第一批层级笔记整理完再开放。"
          />
        )}
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
        <HomeTimeline articles={allArticles} />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
          <HomeTagCloud items={archiveOverview.tags} />
          <HomeProfileCard
            title={siteConfig.profile.title}
            summary={siteConfig.profile.summary}
            status={siteConfig.profile.status}
            location={siteConfig.profile.location}
            quotes={hitokotoQuotes}
            email={siteConfig.email}
          />
        </div>
      </section>
    </PageShell>
  )
}
export default function Page(
  props: Awaited<ReturnType<typeof load>> & { location: string }
) {
  return (
    <IslandProvider location={props.location}>
      <View {...props} />
    </IslandProvider>
  )
}
