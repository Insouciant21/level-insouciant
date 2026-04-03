function normalizeFenceMeta(meta: string) {
  if (meta.includes('title="')) {
    return meta.trim()
  }

  return meta.replace(
    /filename=(?:"([^"]+)"|'([^']+)'|([^\s]+))/,
    (_, doubleQuoted, singleQuoted, bare) => {
      const value = doubleQuoted ?? singleQuoted ?? bare ?? ""
      return `title="${value}"`
    }
  ).trim()
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
      ? Math.min(...nonEmptyLines.map((line) => line.match(/^[\t ]*/)?.[0].length ?? 0))
      : 0

  return lines.map((line) => line.slice(minIndent)).join("\n")
}

export function normalizeMdxSource(source: string) {
  return source.replace(/```([^\n]*)\n([\s\S]*?)```/g, (_, rawMeta: string, rawCode: string) => {
    const meta = normalizeFenceMeta(rawMeta)
    const code = normalizeCodeBlockContent(rawCode)

    return `\`\`\`${meta}\n${code}\n\`\`\``
  })
}
