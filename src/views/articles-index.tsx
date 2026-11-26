import * as React from "react"
import { Search, X } from "lucide-react"

import { ArticleCard } from "@/components/blog/article-card"
import { EmptyState } from "@/components/blog/empty-state"
import { PageIntro } from "@/components/blog/page-intro"
import { PageShell } from "@/components/blog/page-shell"
import { MotionReveal } from "@/components/motion/page-transition"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

import type { load } from "@/server/pages/articles-index"
import { IslandProvider } from "@/components/providers/island-provider"

function View({ articles }: Awaited<ReturnType<typeof load>>) {
  const [selectedCategory, setSelectedCategory] = React.useState<string>("ALL")
  const [filterText, setFilterText] = React.useState("")

  const categories = React.useMemo(
    () => Array.from(new Set(articles.map((article) => article.category))),
    [articles]
  )

  const filteredArticles = React.useMemo(() => {
    const query = filterText.trim().toLowerCase()

    return articles.filter((article) => {
      if (selectedCategory !== "ALL" && article.category !== selectedCategory) {
        return false
      }

      if (!query) {
        return true
      }

      const haystack = [
        article.archiveCode,
        article.title,
        article.desc,
        article.category,
        ...article.tags,
      ]
        .join(" ")
        .toLowerCase()

      return haystack.includes(query)
    })
  }, [articles, filterText, selectedCategory])

  return (
    <PageShell className="gap-8">
      <PageIntro eyebrow="Archive" title="层级档案" />

      {articles.length > 0 ? (
        <MotionReveal variant="fadeUp" duration={0.28} delay={0.02}>
          <div className="grid gap-8">
            <section
              aria-label="档案筛选栏"
              className="public-summary-panel flex flex-col gap-4 px-5 py-4 sm:px-6"
            >
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedCategory("ALL")}
                    aria-pressed={selectedCategory === "ALL"}
                    className={cn(
                      "chrome-pill cursor-pointer px-3 py-1.5 text-[0.68rem]",
                      selectedCategory === "ALL"
                        ? "border-primary/70 bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                    )}
                  >
                    全部 ({articles.length})
                  </button>
                  {categories.map((category) => {
                    const count = articles.filter(
                      (article) => article.category === category
                    ).length
                    const active = selectedCategory === category

                    return (
                      <button
                        key={category}
                        type="button"
                        onClick={() => setSelectedCategory(category)}
                        aria-pressed={active}
                        className={cn(
                          "chrome-pill cursor-pointer px-3 py-1.5 text-[0.68rem]",
                          active
                            ? "border-primary/70 bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                        )}
                      >
                        {category} ({count})
                      </button>
                    )
                  })}
                </div>

                <div className="relative flex w-full items-center lg:w-72">
                  <Search
                    className="pointer-events-none absolute left-3 size-3.5 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <Input
                    type="search"
                    value={filterText}
                    onChange={(event) => setFilterText(event.target.value)}
                    placeholder="按编号、标题或标签筛选..."
                    aria-label="筛选层级档案"
                    className="field-input h-9 pr-8 pl-9 text-xs"
                  />
                  {filterText ? (
                    <button
                      type="button"
                      aria-label="清空筛选条件"
                      onClick={() => setFilterText("")}
                      className="absolute right-2.5 text-muted-foreground transition hover:text-foreground"
                    >
                      <X className="size-3.5" aria-hidden="true" />
                    </button>
                  ) : null}
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-border/60 pt-3 font-mono text-[0.68rem] tracking-[0.16em] text-muted-foreground uppercase">
                <span>
                  DISPLAYING {filteredArticles.length} / {articles.length}{" "}
                  RECORDS
                </span>
                {selectedCategory !== "ALL" || filterText ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    onClick={() => {
                      setSelectedCategory("ALL")
                      setFilterText("")
                    }}
                  >
                    重置筛选
                  </Button>
                ) : null}
              </div>
            </section>

            {filteredArticles.length > 0 ? (
              <section className="grid gap-4">
                {filteredArticles.map((article) => (
                  <ArticleCard key={article.slug} article={article} />
                ))}
              </section>
            ) : (
              <EmptyState
                title="没有符合条件的档案记录"
                description="当前筛选关键词或分类下没有找到匹配条目，可以重置条件继续浏览。"
              />
            )}
          </div>
        </MotionReveal>
      ) : (
        <EmptyState
          title="还没有可访问的档案"
          description="入口已经搭好，等第一批层级记录完成整理后这里会显示列表。"
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
