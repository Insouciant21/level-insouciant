export type TocItem = {
  id: string
  text: string
  depth: 2 | 3
}

function stripMarkdownSyntax(value: string) {
  return value
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_~]/g, "")
    .replace(/<[^>]+>/g, "")
    .trim()
}

export function slugifyHeading(value: string) {
  return stripMarkdownSyntax(value)
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function createHeadingIdFactory() {
  const counts = new Map<string, number>()

  return (value: string) => {
    const base = slugifyHeading(value)
    const nextCount = (counts.get(base) ?? 0) + 1
    counts.set(base, nextCount)

    return nextCount === 1 ? base : `${base}-${nextCount}`
  }
}

export function extractTableOfContents(source: string): TocItem[] {
  const nextId = createHeadingIdFactory()

  return source
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => /^(##|###)\s+/.test(line))
    .map((line) => {
      const match = line.match(/^(##|###)\s+(.+)$/)

      if (!match) {
        return null
      }

      const [, hashes, rawText] = match
      const text = stripMarkdownSyntax(rawText)
      const depth = hashes.length as 2 | 3

      return {
        id: nextId(text),
        text,
        depth,
      }
    })
    .filter((item): item is TocItem => item !== null)
}
