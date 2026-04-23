import Link from "next/link"

import { toArchiveSlug } from "@/lib/content"

type CategoryBadgeProps = {
  category: string
}

function CategoryBadge({ category }: CategoryBadgeProps) {
  return (
    <Link
      href={`/categories/${toArchiveSlug(category)}`}
      className="inline-flex max-w-full whitespace-normal break-words border border-[#73766f]/48 bg-[#d9d1ad]/54 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-muted-foreground shadow-[inset_0_1px_0_rgba(255,252,225,0.18)] transition duration-500 hover:border-foreground/20 hover:bg-[#c6bd99]/58 hover:text-foreground"
    >
      {category}
    </Link>
  )
}

export { CategoryBadge }
