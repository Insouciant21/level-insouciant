import Link from "@/lib/navigation"

import { Badge } from "@/components/ui/badge"
import { toArchiveSlug } from "@/lib/content-presentation"

type CategoryBadgeProps = {
  category: string
}

function CategoryBadge({ category }: CategoryBadgeProps) {
  return (
    <Badge
      asChild
      variant="outline"
      className="h-auto max-w-full border-[#73766f]/48 bg-[#d9d1ad]/54 px-3 py-1 text-[0.68rem] font-semibold tracking-[0.28em] break-words whitespace-normal text-muted-foreground uppercase shadow-[inset_0_1px_0_rgba(255,252,225,0.18)] transition duration-500 hover:border-foreground/20 hover:bg-[#c6bd99]/58 hover:text-foreground"
    >
      <Link href={`/categories/${toArchiveSlug(category)}`}>{category}</Link>
    </Badge>
  )
}

export { CategoryBadge }
