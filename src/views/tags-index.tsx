import * as React from "react"
import { Search, X } from "lucide-react"
import Link from "@/lib/navigation"
import { EmptyState } from "@/components/blog/empty-state"
import { PageIntro } from "@/components/blog/page-intro"
import { PageShell } from "@/components/blog/page-shell"
import { TagAggregateSection } from "@/components/blog/tag-aggregate-section"
import { Input } from "@/components/ui/input"

const tagOverviewPanelClass = "public-summary-panel"
const tagOverviewLinkClass =
  "public-summary-card-muted inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium transition duration-200 hover:border-foreground/30 hover:bg-[#d9d1ad]/58 hover:text-foreground"

import type { load } from "@/server/pages/tags-index"
import { IslandProvider } from "@/components/providers/island-provider"

function View({ tags }: Awaited<ReturnType<typeof load>>) {
  const [filterText, setFilterText] = React.useState("")

  const visibleTags = React.useMemo(() => {
    const query = filterText.trim().toLowerCase()
    if (!query) {
      return tags
    }

    return tags.filter(
      (tag) =>
        tag.name.toLowerCase().includes(query) ||
        tag.slug.toLowerCase().includes(query)
    )
  }, [filterText, tags])

  return (
    <PageShell className="gap-8">
      <PageIntro eyebrow="Tags" title="标签归档" />

      {tags.length > 0 ? (
        <div className="grid gap-6">
          <section className={`${tagOverviewPanelClass} px-6 py-6`}>
            <header className="site-section-header">
              <div>
                <p className="utility-kicker">Overview</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                  标签总览
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex w-full items-center sm:w-56">
                  <Search
                    className="pointer-events-none absolute left-3 size-3.5 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <Input
                    type="search"
                    value={filterText}
                    onChange={(event) => setFilterText(event.target.value)}
                    placeholder="过滤标签..."
                    aria-label="过滤标签"
                    className="field-input h-8 pr-7 pl-8 text-xs"
                  />
                  {filterText ? (
                    <button
                      type="button"
                      aria-label="清空标签过滤"
                      onClick={() => setFilterText("")}
                      className="absolute right-2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="size-3.5" aria-hidden="true" />
                    </button>
                  ) : null}
                </div>

                <span className="chrome-pill">{visibleTags.length} 个主题</span>
              </div>
            </header>

            <div className="mt-6 flex flex-wrap gap-2.5">
              {visibleTags.map((tag) => (
                <Link
                  key={tag.slug}
                  href={`#${tag.slug}`}
                  className={tagOverviewLinkClass}
                >
                  <span>{tag.name}</span>
                  <span className="border-l border-border/70 pl-2 font-mono text-xs text-muted-foreground tabular-nums">
                    {tag.count}
                  </span>
                </Link>
              ))}
            </div>
          </section>

          {visibleTags.length > 0 ? (
            <div className="grid gap-6">
              {visibleTags.map((tag) => (
                <TagAggregateSection key={tag.slug} tag={tag} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="没有匹配的标签"
              description="当前过滤条件没有匹配到标签主题，可以清空关键词重新查看。"
            />
          )}
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
