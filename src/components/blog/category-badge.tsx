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
      className="inline-flex rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground transition hover:bg-secondary hover:text-foreground"
    >
      {category}
    </Link>
  )
}

export { CategoryBadge }
