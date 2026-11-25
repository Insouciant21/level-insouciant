import Link from "@/lib/navigation"
import { ArrowLeft, ArrowRight } from "lucide-react"

import { formatDisplayDate } from "@/lib/content-presentation"
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
      <div className="article-sidecard flex min-h-36 flex-col justify-between gap-4 px-5 py-5 opacity-85 sm:px-6">
        <div className="space-y-2">
          <p className="utility-kicker">{label} // Terminus</p>
          <p className="text-base font-semibold tracking-tight text-foreground/80">
            此方向的走廊已经到头
          </p>
          <p className="text-sm leading-6 text-muted-foreground">
            没有更早或更新的相邻记录了，可以回到档案目录继续探索。
          </p>
        </div>

        <div>
          <Link
            href="/articles"
            className="chrome-pill hover:border-foreground/35 hover:bg-[#d9d1ad]/70"
          >
            <ArrowLeft className="size-3.5" aria-hidden="true" />
            <span>返回全部档案</span>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <Link
      href={`/articles/${article.slug}`}
      className={cn(
        "article-sidecard group flex min-h-36 flex-col justify-between gap-4 px-5 py-5 shadow-[0_14px_28px_-26px_rgba(0,0,0,0.3)] transition duration-200 hover:-translate-y-0.5 hover:border-foreground/30 hover:bg-[#d9d1ad]/65 hover:shadow-[0_20px_38px_-30px_rgba(0,0,0,0.38)] sm:px-6",
        isPrevious ? "text-left" : "text-left sm:text-right"
      )}
    >
      <div
        className={cn(
          "flex items-center gap-2 font-mono text-[0.68rem] font-medium tracking-[0.2em] text-muted-foreground uppercase",
          isPrevious ? "justify-start" : "justify-start sm:justify-end"
        )}
      >
        {isPrevious ? <ArrowLeft className="size-3.5" /> : null}
        <span>{label}</span>
        {!isPrevious ? <ArrowRight className="size-3.5" /> : null}
      </div>

      <div className="space-y-2">
        <p className="text-lg font-semibold tracking-tight text-balance text-foreground transition-colors group-hover:text-destructive">
          {article.title}
        </p>
        <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">
          {article.desc}
        </p>
      </div>

      <p className="font-mono text-xs text-muted-foreground">
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
      className="mx-auto grid w-full max-w-[1200px] gap-4 md:grid-cols-2"
    >
      <PaginationItem article={previous} label="上一篇" direction="previous" />
      <PaginationItem article={next} label="下一篇" direction="next" />
    </nav>
  )
}

export { ArticlePaginationNav }
