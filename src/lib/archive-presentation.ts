import type { ArticleSummary } from "@/types/blog"

type ArchiveSignal = {
  designation: string
}

export function formatArchiveCode(sequence: bigint): string {
  const prefixIndex = sequence - 1n
  const prefix = String.fromCharCode(
    65 + Number((prefixIndex / 26n) % 26n),
    65 + Number(prefixIndex % 26n)
  )
  // Prefixes can repeat; the full database sequence makes each code unique.
  return `${prefix}-${sequence.toString().padStart(4, "0")}`
}

export function getArchiveSignal(
  article: Pick<ArticleSummary, "archiveCode">
): ArchiveSignal {
  return {
    designation: article.archiveCode,
  }
}
