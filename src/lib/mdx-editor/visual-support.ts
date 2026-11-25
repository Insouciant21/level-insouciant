const YAML_FRONTMATTER_RE = /^\s*---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/

function stripFencedCodeBlocks(source: string): string {
  const lines = source.split(/\r?\n/)
  const kept: string[] = []
  let fenceChar: "`" | "~" | null = null
  let fenceLength = 0

  for (const line of lines) {
    if (fenceChar === null) {
      const openMatch = /^ {0,3}(`{3,}|~{3,})(.*)$/.exec(line)
      if (
        openMatch &&
        (openMatch[1][0] !== "`" || !openMatch[2].includes("`"))
      ) {
        fenceChar = openMatch[1][0] as "`" | "~"
        fenceLength = openMatch[1].length
        continue
      }
      kept.push(line)
      continue
    }

    const closeMatch = /^ {0,3}(`{3,}|~{3,})\s*$/.exec(line)
    if (
      closeMatch &&
      closeMatch[1][0] === fenceChar &&
      closeMatch[1].length >= fenceLength
    ) {
      fenceChar = null
      fenceLength = 0
    }
  }

  return kept.join("\n")
}

function isEscaped(source: string, index: number): boolean {
  let backslashes = 0
  for (let i = index - 1; i >= 0 && source[i] === "\\"; i -= 1) {
    backslashes += 1
  }
  return backslashes % 2 === 1
}

function stripInlineCodeSpans(source: string): string {
  let result = ""
  let index = 0

  while (index < source.length) {
    if (source[index] === "`" && !isEscaped(source, index)) {
      let tickCount = 0
      while (source[index + tickCount] === "`") {
        tickCount += 1
      }
      let cursor = index + tickCount
      let closed = false

      while (cursor < source.length) {
        if (source[cursor] === "`") {
          let runLength = 0
          while (source[cursor + runLength] === "`") {
            runLength += 1
          }
          if (runLength === tickCount) {
            result += " "
            index = cursor + runLength
            closed = true
            break
          }
          cursor += runLength
          continue
        }
        cursor += 1
      }

      if (!closed) {
        result += source.slice(index, index + tickCount)
        index += tickCount
      }
      continue
    }

    result += source[index]
    index += 1
  }

  return result
}

export function canUseVisualEditor(source: string): boolean {
  const normalizedSource = source.trim()

  if (!normalizedSource) {
    return true
  }

  if (YAML_FRONTMATTER_RE.test(source)) {
    return false
  }

  // Strip fenced/inline code and complete math spans before checking for MDX
  // constructs. Keep escaped dollars and incomplete formulas in the fallback.
  const nonCodeSource = stripInlineCodeSpans(stripFencedCodeBlocks(source))
  const proseSource = nonCodeSource.replace(
    /(?<![\\$])\$\$[^$]+\$\$(?!\$)|(?<![\\$])\$[^$\n]+\$(?!\$)/g,
    ""
  )

  if (/^\s*(import|export)\s+/m.test(proseSource)) {
    return false
  }

  if (/(?<!\\)<\/?[A-Za-z][^>]*>|<!--[\s\S]*?-->/.test(proseSource)) {
    return false
  }

  if (/(^|[^\\])\{[^}\n]+\}/.test(proseSource)) {
    return false
  }

  return true
}
