import Link from "next/link"

import { toArchiveSlug } from "@/lib/content"

type TagListProps = {
  tags: string[]
}

const tagListChipClass =
  "public-summary-chip max-w-full whitespace-normal break-words px-3 py-1 text-[0.66rem] font-semibold uppercase tracking-[0.26em] text-muted-foreground transition duration-500 hover:border-foreground/20 hover:bg-[#c6bd99]/56 hover:text-foreground"

function TagList({ tags }: TagListProps) {
  return (
    <ul className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <li key={tag}>
          <Link
            href={`/tags/${toArchiveSlug(tag)}`}
            className={tagListChipClass}
          >
            {tag}
          </Link>
        </li>
      ))}
    </ul>
  )
}

export { TagList }
