import Link from "@/lib/navigation"

import { getArchiveSignal } from "@/lib/archive-presentation"
import { formatDisplayDate } from "@/lib/content-presentation"
import type { ArticleSummary } from "@/types/blog"

type TagAggregateSectionProps = {
  tag: {
    name: string
    slug: string
    count: number
    articles: ArticleSummary[]
  }
}

const tagPanelClass = "public-summary-panel"
const tagEntryClass =
  "public-summary-card archive-card-interactive group px-4 py-4 hover:-translate-y-0.5 hover:border-foreground/28 hover:bg-[#d9d1ad]/56 hover:shadow-[inset_0_1px_0_rgba(255,252,225,0.18),0_18px_36px_-30px_rgba(0,0,0,0.4)]"

function TagAggregateSection({ tag }: TagAggregateSectionProps) {
  return (
    <section
      id={tag.slug}
      className={`${tagPanelClass} scroll-mt-28 px-6 py-6 sm:px-7`}
    >
      <header className="site-section-header">
        <div>
          <p className="utility-kicker">Tag</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            <Link
              href={`/tags/${tag.slug}`}
              className="transition duration-200 hover:text-destructive focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-foreground/50 focus-visible:outline-none"
            >
              {tag.name}
            </Link>
          </h2>
          <p className="mt-1.5 text-sm leading-7 text-muted-foreground">
            {tag.count} 条公开档案与这个主题相关。
          </p>
        </div>
      </header>

      <div className="mt-5 grid gap-3">
        {tag.articles.map((article) => {
          const signal = getArchiveSignal(article)

          return (
            <Link
              key={article.slug}
              href={`/articles/${article.slug}`}
              className={tagEntryClass}
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="utility-charcoal-chip px-1.5 py-0.5 font-mono text-[0.62rem]">
                      {signal.designation}
                    </span>
                    <h3 className="text-lg font-semibold tracking-tight transition duration-200 group-hover:text-destructive">
                      {article.title}
                    </h3>
                  </div>
                  <p className="text-sm leading-7 text-muted-foreground">
                    {article.desc}
                  </p>
                </div>
                <p className="shrink-0 font-mono text-xs text-muted-foreground">
                  {formatDisplayDate(article.date)}
                </p>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}

export { TagAggregateSection }
