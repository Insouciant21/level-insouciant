import Link from "next/link"

import { toArchiveSlug } from "@/lib/content"

type CategoryBadgeProps = {
  category: string
}

function CategoryBadge({ category }: CategoryBadgeProps) {
  return (
    <Link
      href={`/categories/${toArchiveSlug(category)}`}
      className="inline-flex max-w-full whitespace-normal break-words border border-border/90 bg-background/85 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-muted-foreground transition hover:border-foreground/25 hover:text-foreground"
    >
      {category}
    </Link>
  )
}

export { CategoryBadge }
