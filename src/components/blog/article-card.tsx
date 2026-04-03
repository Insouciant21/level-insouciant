import Link from "next/link"

import { ArticleMeta } from "@/components/blog/article-meta"
import { CategoryBadge } from "@/components/blog/category-badge"
import { TagList } from "@/components/blog/tag-list"
import type { ArticleSummary } from "@/types/blog"

type ArticleCardProps = {
  article: ArticleSummary
}

function ArticleCard({ article }: ArticleCardProps) {
  return (
    <article className="surface-panel space-y-4 px-6 py-6 transition duration-300 hover:-translate-y-1 hover:border-foreground/20">
      <div className="space-y-3">
        <CategoryBadge category={article.category} />
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight text-balance">
            <Link href={`/articles/${article.slug}`} className="hover:text-primary">
              {article.title}
            </Link>
          </h2>
          <p className="max-w-2xl text-sm leading-7 text-muted-foreground">{article.desc}</p>
        </div>
        <ArticleMeta category={article.category} date={article.date} />
      </div>
      <TagList tags={article.tags} />
    </article>
  )
}

export { ArticleCard }
