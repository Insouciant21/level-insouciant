import { promises as fs } from "node:fs"
import path from "node:path"
import matter from "gray-matter"

import type { Article, ArticleSummary } from "@/types/blog"

const articlesDirectory = path.join(process.cwd(), "content", "articles")

type ManagedArticle = Article & {
  fileName: string
  data: Record<string, unknown>
}

export type ManagedArticleSummary = ArticleSummary & {
  fileName: string
}

function sortArticlesByDate<T extends { date: string }>(articles: T[]) {
  return [...articles].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime()
  })
}

function normalizeTags(value: unknown) {
  if (!Array.isArray(value)) {
    return [] as string[]
  }

  return [...new Set(value.map((tag) => String(tag).trim()).filter(Boolean))]
}

async function getArticleFiles() {
  const files = await fs.readdir(articlesDirectory)
  return files.filter((file) => file.endsWith(".mdx"))
}

async function readManagedArticle(fileName: string): Promise<ManagedArticle> {
  const filePath = path.join(articlesDirectory, fileName)
  const source = await fs.readFile(filePath, "utf8")
  const parsed = matter(source)
  const data = parsed.data as Record<string, unknown>

  return {
    fileName,
    data,
    title: String(data.title),
    desc: String(data.desc),
    date: String(data.date),
    tags: normalizeTags(data.tags),
    category: String(data.category),
    cover: String(data.cover),
    draft: Boolean(data.draft),
    slug: String(data.slug),
    content: parsed.content,
  }
}

async function writeManagedArticle(article: ManagedArticle) {
  const filePath = path.join(articlesDirectory, article.fileName)
  const nextSource = matter.stringify(article.content, article.data)
  await fs.writeFile(filePath, nextSource, "utf8")
}

async function getManagedArticlesInternal() {
  const files = await getArticleFiles()
  const articles = await Promise.all(files.map(readManagedArticle))
  return sortArticlesByDate(articles)
}

export async function getManagedArticles() {
  const articles = await getManagedArticlesInternal()

  return articles.map((article) => ({
    fileName: article.fileName,
    title: article.title,
    desc: article.desc,
    date: article.date,
    tags: article.tags,
    category: article.category,
    cover: article.cover,
    draft: article.draft,
    slug: article.slug,
  })) satisfies ManagedArticleSummary[]
}

async function findManagedArticleBySlug(slug: string) {
  const articles = await getManagedArticlesInternal()
  return articles.find((article) => article.slug === slug) ?? null
}

export async function setArticleDraftState(slug: string, draft: boolean) {
  const article = await findManagedArticleBySlug(slug)

  if (!article) {
    throw new Error("ARTICLE_NOT_FOUND")
  }

  article.data = {
    ...article.data,
    draft,
  }

  await writeManagedArticle(article)
}

export async function deleteArticleBySlug(slug: string) {
  const article = await findManagedArticleBySlug(slug)

  if (!article) {
    throw new Error("ARTICLE_NOT_FOUND")
  }

  const filePath = path.join(articlesDirectory, article.fileName)
  await fs.unlink(filePath)
}

export type ManagedTagSummary = {
  name: string
  count: number
  articleSlugs: string[]
}

export async function getManagedTags() {
  const articles = await getManagedArticlesInternal()
  const counts = new Map<string, { count: number; articleSlugs: string[] }>()

  for (const article of articles) {
    for (const tag of article.tags) {
      const entry = counts.get(tag) ?? { count: 0, articleSlugs: [] }
      entry.count += 1
      entry.articleSlugs.push(article.slug)
      counts.set(tag, entry)
    }
  }

  return [...counts.entries()]
    .map(([name, entry]) => ({
      name,
      count: entry.count,
      articleSlugs: entry.articleSlugs,
    }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)) satisfies ManagedTagSummary[]
}

export async function renameTagAcrossArticles(fromTag: string, toTag: string) {
  const sourceTag = fromTag.trim()
  const targetTag = toTag.trim()

  if (!sourceTag || !targetTag) {
    throw new Error("INVALID_TAG")
  }

  const articles = await getManagedArticlesInternal()

  await Promise.all(
    articles.map(async (article) => {
      if (!article.tags.includes(sourceTag)) {
        return
      }

      const nextTags = [...new Set(article.tags.map((tag) => (tag === sourceTag ? targetTag : tag)).filter(Boolean))]
      article.data = {
        ...article.data,
        tags: nextTags,
      }

      await writeManagedArticle(article)
    })
  )
}

export async function removeTagAcrossArticles(tagToRemove: string) {
  const normalizedTag = tagToRemove.trim()

  if (!normalizedTag) {
    throw new Error("INVALID_TAG")
  }

  const articles = await getManagedArticlesInternal()

  await Promise.all(
    articles.map(async (article) => {
      if (!article.tags.includes(normalizedTag)) {
        return
      }

      article.data = {
        ...article.data,
        tags: article.tags.filter((tag) => tag !== normalizedTag),
      }

      await writeManagedArticle(article)
    })
  )
}
