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

function TagAggregateSection({ tag }: TagAggregateSectionProps) {
  return (
    <section id={tag.slug} className="surface-panel scroll-mt-28 px-6 py-6">
      <div className="flex flex-col gap-4 border-b border-border/60 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Tag</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">{tag.name}</h2>
          <p className="mt-2 text-sm leading-7 text-muted-foreground">
            {tag.count} 篇公开文章与这个主题相关。
          </p>
        </div>
        <Link
          href={`/tags/${tag.slug}`}
          className="text-sm text-muted-foreground transition hover:text-foreground"
        >
          查看独立标签页
        </Link>
      </div>

      <div className="mt-6 grid gap-3">
        {tag.articles.map((article) => (
          <Link
            key={article.slug}
            href={`/articles/${article.slug}`}
            className="rounded-2xl border border-transparent bg-muted/35 px-4 py-4 transition hover:border-border hover:bg-muted/55"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold tracking-tight">{article.title}</h3>
                <p className="text-sm leading-7 text-muted-foreground">{article.desc}</p>
              </div>
              <p className="shrink-0 text-sm text-muted-foreground">{formatDisplayDate(article.date)}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

export { TagAggregateSection }
