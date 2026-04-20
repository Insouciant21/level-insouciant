import Link from "next/link"

import { ArticleMeta } from "@/components/blog/article-meta"
import { CategoryBadge } from "@/components/blog/category-badge"
import { TagList } from "@/components/blog/tag-list"
import { getArchiveSignal } from "@/lib/archive-presentation"
import type { ArticleSummary } from "@/types/blog"

type ArticleCardProps = {
  article: ArticleSummary
}

function ArticleCard({ article }: ArticleCardProps) {
  const signal = getArchiveSignal(article)

  return (
    <article className="group relative overflow-hidden border-[3px] border-black/25 bg-[#ddd5bf] transition duration-500 hover:-translate-y-1 hover:border-foreground/40">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.14),transparent_38%,rgba(0,0,0,0.08))]" />
      <div className="absolute inset-0 shadow-[inset_0_0_42px_rgba(0,0,0,0.14)]" />
      <Link href={`/articles/${article.slug}`} className="absolute inset-0 z-20" aria-label={article.title} />

      <div className="relative z-10 flex min-h-[18rem] flex-col justify-between px-6 py-6">
        <div className="flex items-start gap-4 text-[0.68rem] font-semibold uppercase tracking-[0.26em]">
          <span className="bg-[#171613] px-2 py-1 text-[#f3efe2]">{signal.designation}</span>
        </div>

        <div className="space-y-4">
          <CategoryBadge category={article.category} />
          <div className="border border-black/12 bg-[#f8f4eb]/70 px-4 py-4 backdrop-blur-sm transition duration-500 group-hover:-translate-y-1">
            <div className="space-y-3">
              <h2 className="text-2xl font-semibold leading-tight tracking-tight text-balance sm:text-[2rem]">
                <span className="transition group-hover:text-primary">{article.title}</span>
              </h2>
              <p className="max-w-2xl text-sm leading-8 text-foreground/72 sm:text-[0.96rem]">
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
    </article>
  )
}

export { ArticleCard }
