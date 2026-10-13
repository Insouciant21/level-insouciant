export function canUseVisualEditor(source: string): boolean {
  const normalizedSource = source.trim()

  if (!normalizedSource) {
    return true
  }

  // Ignore complete math spans before checking for MDX expressions. Keep
  // escaped dollars and incomplete formulas in the conservative fallback.
  const nonMathSource = source.replace(
    /(?<![\\$])\$\$[^$]+\$\$(?!\$)|(?<![\\$])\$[^$\n]+\$(?!\$)/g,
    ""
  )

  if (/^\s*(import|export)\s+/m.test(nonMathSource)) {
    return false
  }

  if (/<\/?[A-Za-z][^>]*>/.test(nonMathSource)) {
    return false
  }

  if (/(^|[^\\])\{[^}\n]+\}/.test(nonMathSource)) {
    return false
  }

  if (/^---\s*$/m.test(nonMathSource)) {
    return false
  }

  return true
}
