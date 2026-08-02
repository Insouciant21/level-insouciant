import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { toArchiveSlug } from "@/lib/content"

type TagListProps = {
  tags: string[]
}

const tagListChipClass =
  "h-auto max-w-full whitespace-normal break-words public-summary-chip px-3 py-1 text-[0.66rem] font-semibold tracking-[0.26em] text-muted-foreground uppercase transition duration-500 hover:border-foreground/20 hover:bg-[#c6bd99]/56 hover:text-foreground"

function TagList({ tags }: TagListProps) {
  return (
    <ul className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <li key={tag}>
          <Badge asChild variant="outline" className={tagListChipClass}>
            <Link href={`/tags/${toArchiveSlug(tag)}`}>{tag}</Link>
          </Badge>
        </li>
      ))}
    </ul>
  )
}

export { TagList }
