import { toString } from "mdast-util-to-string"
import { slug as githubSlug } from "github-slugger"
import remarkMdx from "remark-mdx"
import remarkParse from "remark-parse"
import { unified } from "unified"
import { visit } from "unist-util-visit"

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

function slugifyHeading(value: string) {
  return githubSlug(stripMarkdownSyntax(value))
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
  const items: TocItem[] = []

  try {
    const tree = unified().use(remarkParse).use(remarkMdx).parse(source)

    visit(tree, "heading", (node) => {
      if (node.depth !== 2 && node.depth !== 3) {
        return
      }

      const text = toString(node).trim()
      items.push({
        id: nextId(text),
        text,
        depth: node.depth,
      })
    })
  } catch {
    return []
  }

  return items
}
