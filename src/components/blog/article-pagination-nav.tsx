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
      <div className="article-sidecard flex min-h-40 flex-col justify-between px-6 py-6 opacity-75">
        <div className="space-y-3">
          <p className="utility-kicker">{label}</p>
          <p className="text-lg font-semibold tracking-tight text-foreground/70">
            已经没有更多文章了
          </p>
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
        "article-sidecard flex min-h-40 flex-col justify-between gap-5 px-5 py-5 shadow-[0_18px_34px_-30px_rgba(0,0,0,0.3)] transition duration-700 hover:-translate-y-0.5 hover:border-foreground/20 hover:bg-[#d9d1ad]/58 hover:shadow-[0_24px_48px_-36px_rgba(0,0,0,0.38)] sm:px-6 sm:py-6",
        isPrevious ? "text-left" : "text-left sm:text-right"
      )}
    >
      <div
        className={cn(
          "flex items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-muted-foreground",
          isPrevious ? "justify-start" : "justify-start sm:justify-end"
        )}
      >
        {isPrevious ? <ArrowLeft className="size-3.5" /> : null}
        <span>{label}</span>
        {!isPrevious ? <ArrowRight className="size-3.5" /> : null}
      </div>

      <div className="space-y-3">
        <p className="text-lg font-semibold tracking-tight text-foreground text-balance">
          {article.title}
        </p>
        <p className="text-sm leading-7 text-muted-foreground">
          {article.desc}
        </p>
      </div>

      <p className="text-sm text-muted-foreground">
        {formatDisplayDate(article.date)}
      </p>
    </Link>
  )
}

function ArticlePaginationNav({ previous, next }: ArticlePaginationNavProps) {
  if (!previous && !next) {
    return null
  }

  return (
    <nav
      aria-label="文章分页导航"
      className="mx-auto grid w-full max-w-[1200px] gap-5 md:grid-cols-2"
    >
      <PaginationItem article={previous} label="上一篇" direction="previous" />
      <PaginationItem article={next} label="下一篇" direction="next" />
    </nav>
  )
}

export { ArticlePaginationNav }
