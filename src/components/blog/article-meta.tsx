import { formatDisplayDate } from "@/lib/content"

type ArticleMetaProps = {
  date: string
  category: string
}

function ArticleMeta({ date, category }: ArticleMetaProps) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
      <span>{formatDisplayDate(date)}</span>
      <span className="text-border">/</span>
      <span>{category}</span>
    </div>
  )
}

export { ArticleMeta }
