import Link from "next/link"

import { toArchiveSlug } from "@/lib/content"

type TagListProps = {
  tags: string[]
}

function TagList({ tags }: TagListProps) {
  return (
    <ul className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <li key={tag}>
          <Link
            href={`/tags/${toArchiveSlug(tag)}`}
            className="inline-flex max-w-full whitespace-normal break-words border border-border/80 bg-card/78 px-3 py-1 text-[0.66rem] font-semibold uppercase tracking-[0.26em] text-muted-foreground transition hover:border-foreground/25 hover:text-foreground"
          >
            {tag}
          </Link>
        </li>
      ))}
    </ul>
  )
}

export { TagList }
