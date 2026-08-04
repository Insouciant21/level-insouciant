import remarkMdx from "remark-mdx"
import remarkParse from "remark-parse"
import remarkStringify from "remark-stringify"
import { unified } from "unified"
import { visit } from "unist-util-visit"

function normalizeFenceMeta(meta: string) {
  if (meta.includes('title="')) {
    return meta.trim()
  }

  return meta
    .replace(
      /filename=(?:"([^"]+)"|'([^']+)'|([^\s]+))/,
      (_, doubleQuoted, singleQuoted, bare) => {
        const value = doubleQuoted ?? singleQuoted ?? bare ?? ""
        return `title="${value}"`
      }
    )
    .trim()
}

function normalizeCodeBlockContent(content: string) {
  const normalized = content.replace(/\r\n/g, "\n")
  const lines = normalized.split("\n")

  while (lines.length > 0 && lines[0]?.trim() === "") {
    lines.shift()
  }

  while (lines.length > 0 && lines.at(-1)?.trim() === "") {
    lines.pop()
  }

  const nonEmptyLines = lines.filter((line) => line.trim().length > 0)
  const minIndent =
    nonEmptyLines.length > 0
      ? Math.min(
          ...nonEmptyLines.map((line) => line.match(/^[\t ]*/)?.[0].length ?? 0)
        )
      : 0

  return lines.map((line) => line.slice(minIndent)).join("\n")
}

const mdxNormalizationProcessor = unified()
  .use(remarkParse)
  .use(remarkMdx)
  .use(() => (tree) => {
    visit(tree, "code", (node) => {
      const codeNode = node as {
        meta?: string | null
        value: string
      }

      codeNode.meta = normalizeFenceMeta(codeNode.meta ?? "")
      codeNode.value = normalizeCodeBlockContent(codeNode.value)
    })
  })
  .use(remarkStringify)

export function parseMdxTree(source: string) {
  return mdxNormalizationProcessor.parse(source)
}

export function normalizeMdxSource(source: string) {
  try {
    const tree = parseMdxTree(source)
    const normalizedTree = mdxNormalizationProcessor.runSync(
      tree
    ) as typeof tree
    return mdxNormalizationProcessor.stringify(normalizedTree)
  } catch {
    return source
  }
}
