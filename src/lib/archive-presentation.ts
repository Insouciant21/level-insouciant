import type { ArticleSummary } from "@/types/blog"

type ArchiveSignal = {
  designation: string
}

function hashString(value: string) {
  let hash = 0

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0
  }

  return hash
}

export function getArchiveSignal(
  article: Pick<ArticleSummary, "slug" | "title" | "category" | "tags">
): ArchiveSignal {
  const hash = hashString(`${article.slug}:${article.category}:${article.tags.join("|")}`)
  const designation = `L-${String((hash % 48) + 1).padStart(2, "0")}`

  return {
    designation,
  }
}
