import Link from "next/link"

import { formatDisplayDate } from "@/lib/content"
import type { ArticleSummary } from "@/types/blog"

type TagAggregateSectionProps = {
  tag: {
    name: string
    slug: string
    count: number
    articles: ArticleSummary[]
  }
}

const tagPanelClass =
  "public-summary-panel"
const tagEntryClass =
  "public-summary-card group px-4 py-4 transition duration-700 hover:-translate-y-0.5 hover:border-foreground/20 hover:bg-[#d9d1ad]/50 hover:shadow-[inset_0_1px_0_rgba(255,252,225,0.18),0_20px_42px_-34px_rgba(0,0,0,0.42)]"

function TagAggregateSection({ tag }: TagAggregateSectionProps) {
  return (
    <section
      id={tag.slug}
      className={`${tagPanelClass} scroll-mt-28 px-6 py-6 sm:px-7`}
    >
      <div className="flex flex-col gap-4 border-b border-border/60 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="utility-kicker">Tag</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">
            {tag.name}
          </h2>
          <p className="mt-2 text-sm leading-7 text-muted-foreground">
            {tag.count} 条公开档案与这个主题相关。
          </p>
        </div>
        <Link
          href={`/tags/${tag.slug}`}
          className="public-summary-card-muted inline-flex px-3 py-2 text-sm text-muted-foreground transition duration-500 hover:border-foreground/20 hover:bg-[#d9d1ad]/46 hover:text-foreground"
        >
          查看独立标签页
        </Link>
      </div>

      <div className="mt-6 grid gap-3">
        {tag.articles.map((article) => (
          <Link
            key={article.slug}
            href={`/articles/${article.slug}`}
            className={tagEntryClass}
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold tracking-tight transition duration-700 group-hover:text-destructive">
                  {article.title}
                </h3>
                <p className="text-sm leading-7 text-muted-foreground">
                  {article.desc}
                </p>
              </div>
              <p className="shrink-0 text-sm text-muted-foreground">
                {formatDisplayDate(article.date)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

export { TagAggregateSection }
