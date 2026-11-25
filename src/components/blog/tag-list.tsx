import Link from "@/lib/navigation"

import { Badge } from "@/components/ui/badge"
import { toArchiveSlug } from "@/lib/content-presentation"

type TagListProps = {
  tags: string[]
}

const tagListChipClass =
  "h-auto max-w-full whitespace-normal break-words public-summary-chip px-2.5 py-1 text-[0.64rem] font-medium tracking-[0.18em] text-muted-foreground uppercase transition duration-200 hover:border-foreground/30 hover:bg-[#c6bd99]/68 hover:text-foreground"

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
