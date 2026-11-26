import Link from "@/lib/navigation"
import { ArrowRight } from "lucide-react"

import { ArticleMeta } from "@/components/blog/article-meta"
import { CategoryBadge } from "@/components/blog/category-badge"
import { TagList } from "@/components/blog/tag-list"
import { Card } from "@/components/ui/card"
import { getArchiveSignal } from "@/lib/archive-presentation"
import type { ArticleSummary } from "@/types/blog"

type ArticleCardProps = {
  article: ArticleSummary
}

function ArticleCard({ article }: ArticleCardProps) {
  const signal = getArchiveSignal(article)

  return (
    <Card className="archive-card-interactive group relative rounded-[0.25rem] border border-[#73766f]/58 bg-[#c6bd99]/82 py-0 shadow-[inset_0_1px_0_rgba(255,252,225,0.22),0_18px_40px_-34px_rgba(0,0,0,0.46)] before:pointer-events-none before:absolute before:inset-0 before:z-0 before:bg-[linear-gradient(180deg,rgba(255,252,225,0.12),transparent_42%,rgba(24,27,23,0.1)),radial-gradient(circle_at_16%_20%,rgba(24,27,23,0.06)_0_1px,transparent_1.6px)] before:opacity-50 before:content-[''] hover:-translate-y-0.5 hover:border-foreground/32 hover:shadow-[0_24px_52px_-36px_rgba(0,0,0,0.52)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-0.5 bg-[linear-gradient(90deg,transparent,rgb(var(--safety-exit-green-rgb)/45%),transparent)] opacity-0 transition-opacity duration-200 group-hover:opacity-100" />

      <div className="relative flex min-w-0 flex-col gap-4 px-5 py-5 sm:px-6 sm:py-5">
        <div className="flex flex-wrap items-center justify-between gap-3 font-mono text-[0.68rem] font-medium tracking-[0.22em] uppercase">
          <div className="flex flex-wrap items-center gap-3">
            <span className="utility-charcoal-chip px-2 py-1">
              {signal.designation}
            </span>
            <CategoryBadge
              category={article.category}
              className="relative z-20"
            />
          </div>

          <span className="hidden items-center gap-1 text-[0.65rem] text-primary opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100 sm:inline-flex">
            OPEN RECORD
            <ArrowRight className="size-3" aria-hidden="true" />
          </span>
        </div>

        <div className="rounded-[0.2rem] border border-[#73766f]/45 bg-[#d9d1ad]/62 px-4 py-4 shadow-[0_12px_24px_-22px_rgba(0,0,0,0.3)] transition duration-200 group-hover:border-foreground/20 group-hover:bg-[#d9d1ad]/80">
          <div className="space-y-2">
            <h2 className="text-xl leading-snug font-semibold tracking-tight text-balance break-words sm:text-2xl">
              <Link
                href={`/articles/${article.slug}`}
                className="transition-colors duration-200 group-hover:text-destructive after:absolute after:inset-0 after:z-10 focus-visible:outline-none"
              >
                {article.title}
              </Link>
            </h2>
            {article.desc ? (
              <p className="max-w-3xl text-sm leading-7 break-words text-foreground/78 sm:text-[0.95rem]">
                {article.desc}
              </p>
            ) : null}
          </div>

          <div className="mt-4 flex flex-col gap-3 border-t border-black/10 pt-3.5 sm:flex-row sm:items-center sm:justify-between">
            <ArticleMeta category={article.category} date={article.date} />
            <div className="relative z-20">
              <TagList tags={article.tags.slice(0, 4)} />
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

export { ArticleCard }
