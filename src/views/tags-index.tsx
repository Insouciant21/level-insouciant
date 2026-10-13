import Link from "@/lib/navigation"
import { EmptyState } from "@/components/blog/empty-state"
import { PageIntro } from "@/components/blog/page-intro"
import { PageShell } from "@/components/blog/page-shell"
import { TagAggregateSection } from "@/components/blog/tag-aggregate-section"
const tagOverviewPanelClass = "public-summary-panel"
const tagOverviewLinkClass =
  "public-summary-card-muted inline-flex items-center gap-2 px-4 py-2 text-sm font-medium transition duration-500 hover:border-foreground/20 hover:bg-[#d9d1ad]/46 hover:text-foreground"
import type { load } from "@/server/pages/tags-index"
import { IslandProvider } from "@/components/providers/island-provider"
function View({ tags }: Awaited<ReturnType<typeof load>>) {
  return (
    <PageShell>
      <PageIntro eyebrow="Tags" title="标签归档" />

      {tags.length > 0 ? (
        <div className="grid gap-6">
          <section className={`${tagOverviewPanelClass} px-6 py-6`}>
            <header className="site-section-header">
              <div>
                <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">
                  Overview
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                  标签总览
                </h2>
              </div>
              <p className="text-sm text-muted-foreground">
                {tags.length} 个标签主题
              </p>
            </header>

            <div className="mt-6 flex flex-wrap gap-3">
              {tags.map((tag) => (
                <Link
                  key={tag.slug}
                  href={`#${tag.slug}`}
                  className={tagOverviewLinkClass}
                >
                  <span>{tag.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {tag.count}
                  </span>
                </Link>
              ))}
            </div>
          </section>

          <div className="grid gap-6">
            {tags.map((tag) => (
              <TagAggregateSection key={tag.slug} tag={tag} />
            ))}
          </div>
        </div>
      ) : (
        <EmptyState
          title="暂时还没有标签"
          description="发布文章后，标签会自动从文章元数据中聚合出来。"
        />
      )}
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
