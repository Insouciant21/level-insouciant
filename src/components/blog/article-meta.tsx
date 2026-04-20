import { formatDisplayDate } from "@/lib/content"

type ArticleMetaProps = {
  date: string
  category: string
}

function ArticleMeta({ date, category }: ArticleMetaProps) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
      <span>{formatDisplayDate(date)}</span>
      <span className="text-foreground/30">/</span>
      <span>{category}</span>
    </div>
  )
}

export { ArticleMeta }
