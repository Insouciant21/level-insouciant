import Link from "next/link"

type CategoryBadgeProps = {
  category: string
}

function toCategorySlug(category: string) {
  return category
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function CategoryBadge({ category }: CategoryBadgeProps) {
  return (
    <Link
      href={`/categories/${toCategorySlug(category)}`}
      className="inline-flex border border-border/90 bg-background/85 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-muted-foreground transition hover:border-foreground/25 hover:text-foreground"
    >
      {category}
    </Link>
  )
}

export { CategoryBadge }
