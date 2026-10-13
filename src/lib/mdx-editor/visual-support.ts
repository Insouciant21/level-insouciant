export function canUseVisualEditor(source: string): boolean {
  const normalizedSource = source.trim()

  if (!normalizedSource) {
    return true
  }

  if (/^\s*(import|export)\s+/m.test(source)) {
    return false
  }

  if (/<\/?[A-Za-z][^>]*>/.test(source)) {
    return false
  }

  if (/(^|[^\\])\{[^}\n]+\}/.test(source)) {
    return false
  }

  if (/^---\s*$/m.test(source)) {
    return false
  }

  return true
}
