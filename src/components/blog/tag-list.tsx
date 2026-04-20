import Link from "next/link"

type TagListProps = {
  tags: string[]
}

function toTagSlug(tag: string) {
  return tag
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function TagList({ tags }: TagListProps) {
  return (
    <ul className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <li key={tag}>
          <Link
            href={`/tags/${toTagSlug(tag)}`}
            className="inline-flex border border-border/80 bg-card/78 px-3 py-1 text-[0.66rem] font-semibold uppercase tracking-[0.26em] text-muted-foreground transition hover:border-foreground/25 hover:text-foreground"
          >
            {tag}
          </Link>
        </li>
      ))}
    </ul>
  )
}

export { TagList }
