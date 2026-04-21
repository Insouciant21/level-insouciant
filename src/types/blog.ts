export type ArticleFrontmatter = {
  title: string
  desc: string
  date: string
  tags: string[]
  category: string
  cover: string | null
  draft: boolean
  slug: string
}

export type ArticleSummary = ArticleFrontmatter

export type Article = ArticleFrontmatter & {
  content: string
}

export type ArchiveItem = {
  name: string
  slug: string
  count: number
}
