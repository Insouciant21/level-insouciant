import { parseMdxTree } from "@/lib/mdx"
import { visit } from "unist-util-visit"

export type MediaReference = {
  url: string
  count: number
}

type MdxPosition = {
  start: { offset?: number }
  end: { offset?: number }
}

type MdxNode = {
  type: string
  url?: string
  children?: MdxNode[]
  position?: MdxPosition
}

function visitImageNodes(
  tree: MdxNode,
  visitor: (node: MdxNode, parent: MdxNode | undefined) => void
) {
  visit(
    tree as never,
    "image",
    ((node: unknown, _index: number | undefined, parent: unknown) => {
      visitor(node as MdxNode, parent as MdxNode | undefined)
    }) as never
  )
}

function normalizeReferenceUrl(url: string): string {
  const trimmed = url.trim()

  if (trimmed.endsWith("://")) {
    return trimmed
  }

  return trimmed.replace(/([^:])\/+$/, "$1")
}

function parseMdx(source: string): MdxNode {
  try {
    return parseMdxTree(source) as MdxNode
  } catch {
    throw new Error("MEDIA_REFERENCE_PARSE_FAILED")
  }
}

function getOffsets(node: MdxNode): { start: number; end: number } {
  const start = node.position?.start.offset
  const end = node.position?.end.offset

  if (start === undefined || end === undefined || start > end) {
    throw new Error("MEDIA_REFERENCE_REWRITE_FAILED")
  }

  return { start, end }
}

function lineBreakLength(source: string, offset: number): number {
  if (source.slice(offset, offset + 2) === "\r\n") {
    return 2
  }

  return source[offset] === "\n" ? 1 : 0
}

function precedingLineBreakLength(source: string, offset: number): number {
  if (source.slice(offset - 2, offset) === "\r\n") {
    return 2
  }

  return source[offset - 1] === "\n" ? 1 : 0
}

function getStandaloneParagraphRange(
  source: string,
  paragraph: MdxNode
): { start: number; end: number } {
  const { start: paragraphStart, end: paragraphEnd } = getOffsets(paragraph)
  const lineStart = source.lastIndexOf("\n", paragraphStart - 1) + 1
  const leadingText = source.slice(lineStart, paragraphStart)
  let start = /^[\t ]*$/.test(leadingText) ? lineStart : paragraphStart
  let end = paragraphEnd
  const firstBreakLength = lineBreakLength(source, end)

  if (firstBreakLength > 0) {
    end += firstBreakLength
    const secondBreakLength = lineBreakLength(source, end)

    if (secondBreakLength > 0) {
      end += secondBreakLength
    }
  }

  if (source.slice(end).trim() === "") {
    const previousBreakLength = precedingLineBreakLength(source, start)
    const breakBeforePreviousLength = precedingLineBreakLength(
      source,
      start - previousBreakLength
    )

    if (previousBreakLength > 0 && breakBeforePreviousLength > 0) {
      start -= previousBreakLength
    }
  }

  return { start, end }
}

function isTargetImage(node: MdxNode, normalizedUrl: string): boolean {
  return (
    node.type === "image" &&
    typeof node.url === "string" &&
    normalizeReferenceUrl(node.url) === normalizedUrl
  )
}

export function extractImageReferences(source: string): MediaReference[] {
  const tree = parseMdx(source)
  const references = new Map<string, MediaReference>()

  visitImageNodes(tree, (imageNode) => {
    if (typeof imageNode.url !== "string") {
      return
    }

    const reference = references.get(imageNode.url)

    if (reference) {
      reference.count += 1
      return
    }

    references.set(imageNode.url, { url: imageNode.url, count: 1 })
  })

  return [...references.values()]
}

export function countImageReference(source: string, publicUrl: string): number {
  const normalizedUrl = normalizeReferenceUrl(publicUrl)

  return extractImageReferences(source).reduce(
    (count, reference) =>
      normalizeReferenceUrl(reference.url) === normalizedUrl
        ? count + reference.count
        : count,
    0
  )
}

export function removeImageReferences(
  source: string,
  publicUrl: string
): { source: string; removed: number } {
  const normalizedUrl = normalizeReferenceUrl(publicUrl)
  let tree: MdxNode

  try {
    tree = parseMdx(source)
  } catch {
    throw new Error("MEDIA_REFERENCE_REWRITE_FAILED")
  }

  const ranges: Array<{ start: number; end: number }> = []
  let removed = 0

  visitImageNodes(tree, (imageNode, parentNode) => {
    if (!isTargetImage(imageNode, normalizedUrl)) {
      return
    }

    removed += 1

    if (
      parentNode &&
      parentNode.type === "paragraph" &&
      parentNode.children &&
      parentNode.children.length > 0 &&
      parentNode.children.every((child) => isTargetImage(child, normalizedUrl))
    ) {
      ranges.push(getStandaloneParagraphRange(source, parentNode))
      return
    }

    ranges.push(getOffsets(imageNode))
  })

  const uniqueRanges = [
    ...new Map(
      ranges.map((range) => [`${range.start}:${range.end}`, range])
    ).values(),
  ].sort((left, right) => right.start - left.start)

  let rewrittenSource = source

  for (const range of uniqueRanges) {
    rewrittenSource =
      rewrittenSource.slice(0, range.start) +
      rewrittenSource.slice(range.end)
  }

  return { source: rewrittenSource, removed }
}
