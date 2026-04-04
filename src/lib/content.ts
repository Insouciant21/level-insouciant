import { Prisma } from "@prisma/client"
import type { Article as ArticleRecord } from "@prisma/client"

import type { ArchiveItem, Article, ArticleSummary } from "@/types/blog"
import { prisma } from "@/lib/prisma"

function slugifySegment(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function toArticleSummary(record: ArticleRecord): ArticleSummary {
  return {
    title: record.title,
    desc: record.desc,
    date: record.publishedAt.toISOString(),
    tags: record.tags,
    category: record.category,
    cover: record.cover,
    draft: record.draft,
    slug: record.slug,
  }
}

function toArticle(record: ArticleRecord): Article {
  return {
    ...toArticleSummary(record),
    content: record.content,
  }
}

async function listArticleRecords(options?: { includeDrafts?: boolean }) {
  const includeDrafts = options?.includeDrafts ?? false

  return prisma.article.findMany({
    where: includeDrafts ? undefined : { draft: false },
    orderBy: {
      publishedAt: "desc",
    },
  })
}

export async function getAllArticles(options?: { includeDrafts?: boolean }) {
  const records = await listArticleRecords(options)
  return records.map(toArticleSummary)
}

export async function getArticleBySlug(slug: string, options?: { includeDrafts?: boolean }) {
  const includeDrafts = options?.includeDrafts ?? false

  const record = await prisma.article.findUnique({
    where: { slug },
  })

  if (!record) {
    return null
  }

  if (!includeDrafts && record.draft) {
    return null
  }

  return toArticle(record)
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

  const rows = await prisma.$queryRaw<
    Array<{
      id: string
      slug: string
      title: string
      desc: string
      category: string
      tags: string[]
      cover: string
      draft: boolean
      publishedAt: Date
      rank: number
      similarity: number
    }>
  >(Prisma.sql`
    SELECT
      "id",
      "slug",
      "title",
      "desc",
      "category",
      "tags",
      "cover",
      "draft",
      "publishedAt",
      ts_rank_cd(to_tsvector('simple', "searchDocument"), plainto_tsquery('simple', ${normalizedQuery})) AS "rank",
      similarity("searchDocument", ${normalizedQuery}) AS "similarity"
    FROM "Article"
    WHERE "draft" = false
      AND (
        to_tsvector('simple', "searchDocument") @@ plainto_tsquery('simple', ${normalizedQuery})
        OR "searchDocument" ILIKE '%' || ${normalizedQuery} || '%'
        OR similarity("searchDocument", ${normalizedQuery}) > 0.05
      )
    ORDER BY "rank" DESC, "similarity" DESC, "publishedAt" DESC
    LIMIT 50
  `)

  return rows.map((row) =>
    toArticleSummary({
      id: row.id,
      slug: row.slug,
      title: row.title,
      desc: row.desc,
      category: row.category,
      tags: row.tags,
      cover: row.cover,
      draft: row.draft,
      publishedAt: row.publishedAt,
      content: "",
      searchDocument: "",
      legacySourcePath: null,
      lastEditedByUserId: null,
      createdAt: row.publishedAt,
      updatedAt: row.publishedAt,
    })
  )
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
