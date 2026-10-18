import Link from "@/lib/navigation"

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
    <Card className="group rounded-md border border-[#73766f]/55 bg-[#c6bd99]/78 py-0 shadow-[inset_0_1px_0_rgba(255,252,225,0.2),0_22px_52px_-40px_rgba(0,0,0,0.46)] transition duration-700 before:pointer-events-none before:absolute before:inset-0 before:z-0 before:bg-[linear-gradient(180deg,rgba(255,252,225,0.12),transparent_38%,rgba(24,27,23,0.11)),radial-gradient(circle_at_16%_20%,rgba(24,27,23,0.06)_0_1px,transparent_1.6px)] before:opacity-55 before:content-[''] hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-[0_30px_70px_-46px_rgba(0,0,0,0.52)]">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,252,225,0.12),transparent_38%,rgba(24,27,23,0.1))]" />
      <div className="absolute inset-0 z-0 shadow-[inset_0_0_44px_rgba(24,27,23,0.18)]" />
      <Link
        href={`/articles/${article.slug}`}
        className="absolute inset-0 z-20"
        aria-label={article.title}
      />

      <div className="relative z-10 flex min-h-[18rem] min-w-0 flex-col justify-between px-5 py-5 sm:px-6 sm:py-6">
        <div className="flex flex-wrap items-center gap-3 text-[0.68rem] font-semibold tracking-[0.26em] uppercase">
          <span className="utility-charcoal-chip px-2 py-1">
            {signal.designation}
          </span>
          <CategoryBadge category={article.category} />
        </div>

        <div className="space-y-4">
          <div className="rounded-md border border-[#73766f]/42 bg-[#d9d1ad]/52 px-4 py-4 shadow-[0_16px_30px_-26px_rgba(0,0,0,0.34)] transition duration-700 group-hover:-translate-y-1 group-hover:bg-[#d9d1ad]/62 group-hover:shadow-[0_24px_42px_-30px_rgba(0,0,0,0.4)]">
            <div className="space-y-3">
              <h2 className="text-2xl leading-tight font-semibold tracking-tight text-balance break-words sm:text-[2rem]">
                <span className="transition duration-700 group-hover:text-destructive">
                  {article.title}
                </span>
              </h2>
              <p className="max-w-2xl text-sm leading-8 break-words text-foreground/72 sm:text-[0.96rem]">
                {article.desc}
              </p>
            </div>

            <div className="mt-5 flex flex-col gap-4 border-t border-black/10 pt-4">
              <ArticleMeta category={article.category} date={article.date} />
              <TagList tags={article.tags.slice(0, 4)} />
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

export { ArticleCard }
