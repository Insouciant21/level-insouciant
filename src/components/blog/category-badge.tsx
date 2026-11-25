import Link from "@/lib/navigation"

import { Badge } from "@/components/ui/badge"
import { toArchiveSlug } from "@/lib/content-presentation"
import { cn } from "@/lib/utils"

type CategoryBadgeProps = {
  category: string
  className?: string
}

function CategoryBadge({ category, className }: CategoryBadgeProps) {
  return (
    <Badge
      asChild
      variant="outline"
      className={cn(
        "h-auto max-w-full rounded-[0.1875rem] border-[#73766f]/52 bg-[#d9d1ad]/66 px-2.5 py-1 font-mono text-[0.66rem] font-medium tracking-[0.2em] break-words whitespace-normal text-muted-foreground uppercase shadow-[inset_0_1px_0_rgba(255,252,225,0.18)] transition duration-200 hover:border-foreground/30 hover:bg-[#c6bd99]/75 hover:text-foreground",
        className
      )}
    >
      <Link href={`/categories/${toArchiveSlug(category)}`}>{category}</Link>
    </Badge>
  )
}

export { CategoryBadge }
