import { promises as fs } from "node:fs"
import path from "node:path"
import matter from "gray-matter"

import type { ArchiveItem, Article, ArticleFrontmatter, ArticleSummary } from "@/types/blog"

const articlesDirectory = path.join(process.cwd(), "content", "articles")

function slugifySegment(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function assertFrontmatter(data: Record<string, unknown>, filePath: string): ArticleFrontmatter {
  const requiredFields = [
    "title",
    "desc",
    "date",
    "tags",
    "category",
    "cover",
    "draft",
    "slug",
  ] as const

  for (const field of requiredFields) {
    if (!(field in data)) {
      throw new Error(`Missing frontmatter field "${field}" in ${filePath}`)
    }
  }

  if (!Array.isArray(data.tags) || !data.tags.every((tag) => typeof tag === "string")) {
    throw new Error(`Invalid "tags" frontmatter in ${filePath}`)
  }

  if (typeof data.category !== "string") {
    throw new Error(`Invalid "category" frontmatter in ${filePath}`)
  }

  if (typeof data.draft !== "boolean") {
    throw new Error(`Invalid "draft" frontmatter in ${filePath}`)
  }

  return {
    title: String(data.title),
    desc: String(data.desc),
    date: String(data.date),
    tags: data.tags,
    category: data.category,
    cover: String(data.cover),
    draft: data.draft,
    slug: String(data.slug),
  }
}

async function getArticleFiles() {
  const files = await fs.readdir(articlesDirectory)
  return files.filter((file) => file.endsWith(".mdx"))
}

async function readArticleFile(fileName: string): Promise<Article> {
  const filePath = path.join(articlesDirectory, fileName)
  const source = await fs.readFile(filePath, "utf8")
  const { data, content } = matter(source)
  const frontmatter = assertFrontmatter(data, filePath)

  return {
    ...frontmatter,
    content,
  }
}

function sortArticlesByDate<T extends ArticleFrontmatter>(articles: T[]) {
  return [...articles].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime()
  })
}

function toSummary(article: Article): ArticleSummary {
  return {
    title: article.title,
    desc: article.desc,
    date: article.date,
    tags: article.tags,
    category: article.category,
    cover: article.cover,
    draft: article.draft,
    slug: article.slug,
  }
}

export async function getAllArticles(options?: { includeDrafts?: boolean }) {
  const includeDrafts = options?.includeDrafts ?? false
  const files = await getArticleFiles()
  const articles = await Promise.all(files.map(readArticleFile))
  const filtered = includeDrafts ? articles : articles.filter((article) => !article.draft)

  return sortArticlesByDate(filtered).map(toSummary)
}

export async function getArticleBySlug(slug: string) {
  const files = await getArticleFiles()

  for (const fileName of files) {
    const article = await readArticleFile(fileName)

    if (article.slug === slug) {
      return article.draft ? null : article
    }
  }

  return null
}

function countArchiveItems(items: string[]) {
  const counts = new Map<string, number>()

  for (const item of items) {
    counts.set(item, (counts.get(item) ?? 0) + 1)
  }

  return [...counts.entries()]
    .map(([name, count]) => ({
      name,
      slug: slugifySegment(name),
      count,
    }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
}

export async function getAllTags() {
  const articles = await getAllArticles()
  return countArchiveItems(articles.flatMap((article) => article.tags))
}

export async function getAllCategories() {
  const articles = await getAllArticles()
  return countArchiveItems(articles.map((article) => article.category))
}

async function filterArticlesByArchive(
  archiveType: "tag" | "category",
  slug: string
): Promise<{ name: string; articles: ArticleSummary[] } | null> {
  const articles = await getAllArticles()
  const matched = articles.filter((article) => {
    if (archiveType === "tag") {
      return article.tags.some((tag) => slugifySegment(tag) === slug)
    }

    return slugifySegment(article.category) === slug
  })

  if (matched.length === 0) {
    return null
  }

  const name =
    archiveType === "tag"
      ? matched.flatMap((article) => article.tags).find((tag) => slugifySegment(tag) === slug)
      : matched[0]?.category

  if (!name) {
    return null
  }

  return {
    name,
    articles: matched,
  }
}

export async function getArticlesByTag(slug: string) {
  return filterArticlesByArchive("tag", slug)
}

export async function getArticlesByCategory(slug: string) {
  return filterArticlesByArchive("category", slug)
}

export async function getArchiveOverview() {
  const [tags, categories] = await Promise.all([getAllTags(), getAllCategories()])

  return {
    tags,
    categories,
  }
}

export async function getFeaturedArticles(limit = 3) {
  const articles = await getAllArticles()
  return articles.slice(0, limit)
}

export async function getArticlePagination(slug: string) {
  const articles = await getAllArticles()
  const index = articles.findIndex((article) => article.slug === slug)

  if (index === -1) {
    return null
  }

  return {
    previous: index > 0 ? articles[index - 1] : null,
    next: index < articles.length - 1 ? articles[index + 1] : null,
  }
}

export async function getRelatedArticles(article: ArticleSummary, limit = 2) {
  const articles = await getAllArticles()
  return articles
    .filter((entry) => entry.slug !== article.slug)
    .filter(
      (entry) =>
        entry.category === article.category ||
        entry.tags.some((tag) => article.tags.includes(tag))
    )
    .slice(0, limit)
}

export async function getTagAggregates() {
  const tags = await getAllTags()

  return Promise.all(
    tags.map(async (tag) => {
      const archive = await getArticlesByTag(tag.slug)

      return {
        ...tag,
        articles: archive?.articles ?? [],
      }
    })
  )
}

export async function searchArticles(query: string) {
  const normalizedQuery = query.trim().toLowerCase()

  if (!normalizedQuery) {
    return []
  }

  const articles = await getAllArticles()

  return articles.filter((article) => {
    const searchableText = [
      article.title,
      article.desc,
      article.category,
      ...article.tags,
    ]
      .join(" ")
      .toLowerCase()

    return searchableText.includes(normalizedQuery)
  })
}

export function formatDisplayDate(date: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date))
}

export function getArchiveHref(type: "tags" | "categories", item: Pick<ArchiveItem, "slug">) {
  return `/${type}/${item.slug}`
}
