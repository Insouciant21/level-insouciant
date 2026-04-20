import Link from "next/link"
import { ArrowLeft, ArrowRight } from "lucide-react"

import { formatDisplayDate } from "@/lib/content"
import { cn } from "@/lib/utils"
import type { ArticleSummary } from "@/types/blog"

type ArticlePaginationNavProps = {
  previous: ArticleSummary | null
  next: ArticleSummary | null
}

type PaginationItemProps = {
  article: ArticleSummary | null
  label: string
  direction: "previous" | "next"
}

function PaginationItem({ article, label, direction }: PaginationItemProps) {
  const isPrevious = direction === "previous"

  if (!article) {
    return (
      <div className="surface-panel flex min-h-40 flex-col justify-between px-6 py-6 opacity-70">
        <div className="space-y-3">
          <p className="utility-kicker">{label}</p>
          <p className="text-lg font-semibold tracking-tight text-foreground/70">已经没有更多文章了</p>
          <p className="text-sm leading-7 text-muted-foreground">
            当前方向的导航已经到头，可以回到博客列表继续浏览。
          </p>
        </div>
      </div>
    )
  }

  return (
    <Link
      href={`/articles/${article.slug}`}
      className={cn(
        "surface-panel flex min-h-40 flex-col justify-between gap-5 px-6 py-6 transition duration-300 hover:-translate-y-1 hover:border-foreground/15",
        isPrevious ? "text-left" : "text-left sm:text-right"
      )}
    >
      <div
        className={cn(
          "flex items-center gap-2 text-[0.72rem] font-medium uppercase tracking-[0.24em] text-muted-foreground",
          isPrevious ? "justify-start" : "justify-start sm:justify-end"
        )}
      >
        {isPrevious ? <ArrowLeft className="size-3.5" /> : null}
        <span>{label}</span>
        {!isPrevious ? <ArrowRight className="size-3.5" /> : null}
      </div>

      <div className="space-y-3">
        <p className="text-lg font-semibold tracking-tight text-balance">{article.title}</p>
        <p className="text-sm leading-7 text-muted-foreground">{article.desc}</p>
      </div>

      <p className="text-sm text-muted-foreground">{formatDisplayDate(article.date)}</p>
    </Link>
  )
}

function ArticlePaginationNav({ previous, next }: ArticlePaginationNavProps) {
  if (!previous && !next) {
    return null
  }

  return (
    <nav aria-label="文章分页导航" className="grid gap-5 md:grid-cols-2">
      <PaginationItem article={previous} label="上一篇" direction="previous" />
      <PaginationItem article={next} label="下一篇" direction="next" />
    </nav>
  )
}

export { ArticlePaginationNav }
