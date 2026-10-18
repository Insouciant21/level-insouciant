import { Prisma } from "@prisma/client"

import type { Article, ArticleSummary } from "@/types/blog"
import { prisma } from "@/lib/prisma"
import { formatArchiveCode } from "@/lib/archive-presentation"
import { cache } from "@/server/request-context"

const articleSummarySelect = {
  archiveNumber: true,
  slug: true,
  title: true,
  desc: true,
  publishedAt: true,
  tags: true,
  category: true,
  cover: true,
  draft: true,
} satisfies Prisma.ArticleSelect

const articleDetailSelect = {
  ...articleSummarySelect,
  content: true,
} satisfies Prisma.ArticleSelect

type ArticleSummaryRecord = Prisma.ArticleGetPayload<{
  select: typeof articleSummarySelect
}>

type ArticleDetailRecord = Prisma.ArticleGetPayload<{
  select: typeof articleDetailSelect
}>

function toArticleSummary(record: ArticleSummaryRecord): ArticleSummary {
  return {
    archiveCode: formatArchiveCode(record.archiveNumber),
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

function toArticle(record: ArticleDetailRecord): Article {
  return {
    ...toArticleSummary(record),
    content: record.content,
  }
}

async function listArticleRecords(options?: { includeDrafts?: boolean }) {
  const includeDrafts = options?.includeDrafts ?? false

  return prisma.article.findMany({
    where: includeDrafts ? undefined : { draft: false },
    select: articleSummarySelect,
    orderBy: {
      publishedAt: "desc",
    },
  })
}

async function getAllArticlesUncached(options?: { includeDrafts?: boolean }) {
  const records = await listArticleRecords(options)
  return records.map(toArticleSummary)
}

/** Summary reads omit article bodies and are reused within one request. */
const getAllArticlesByDraftPreference = cache(async (includeDrafts: boolean) =>
  getAllArticlesUncached(includeDrafts ? { includeDrafts } : undefined)
)

export function getAllArticles(options?: { includeDrafts?: boolean }) {
  return getAllArticlesByDraftPreference(options?.includeDrafts ?? false)
}

export async function getArticleSummaryBySlug(
  slug: string,
  options?: { includeDrafts?: boolean }
) {
  const includeDrafts = options?.includeDrafts ?? false
  const record = await prisma.article.findUnique({
    where: { slug },
    select: articleSummarySelect,
  })

  if (!record || (!includeDrafts && record.draft)) {
    return null
  }

  return toArticleSummary(record)
}

export async function getArticleBySlug(
  slug: string,
  options?: { includeDrafts?: boolean }
) {
  const includeDrafts = options?.includeDrafts ?? false

  const record = await prisma.article.findUnique({
    where: { slug },
    select: articleDetailSelect,
  })

  if (!record) {
    return null
  }

  if (!includeDrafts && record.draft) {
    return null
  }

  return toArticle(record)
}

export async function isArticlePublished(slug: string) {
  const record = await prisma.article.findUnique({
    where: { slug },
    select: { draft: true },
  })

  return Boolean(record && !record.draft)
}

function countArchiveItems(items: string[]) {
  const counts = new Map<string, number>()

  for (const item of items) {
    counts.set(item, (counts.get(item) ?? 0) + 1)
  }

  return [...counts.entries()]
    .map(([name, count]) => ({
      name,
      slug: toArchiveSlug(name),
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
  const normalizedSlug = toArchiveSlug(slug)
  const articles = await getAllArticles()
  const matched = articles.filter((article) => {
    if (archiveType === "tag") {
      return article.tags.some((tag) => toArchiveSlug(tag) === normalizedSlug)
    }

    return toArchiveSlug(article.category) === normalizedSlug
  })

  if (matched.length === 0) {
    return null
  }

  const name =
    archiveType === "tag"
      ? matched
          .flatMap((article) => article.tags)
          .find((tag) => toArchiveSlug(tag) === normalizedSlug)
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
  const [tags, categories] = await Promise.all([
    getAllTags(),
    getAllCategories(),
  ])

  return {
    tags,
    categories,
  }
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
      archiveNumber: bigint
      slug: string
      title: string
      desc: string
      category: string
      tags: string[]
      cover: string | null
      draft: boolean
      publishedAt: Date
      rank: number
      similarity: number
    }>
  >(Prisma.sql`
    SELECT
      "id",
      "archiveNumber",
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

  return rows.map((row) => toArticleSummary(row))
}

export {
  formatDisplayDate,
  getArchiveHref,
  toArchiveSlug,
} from "./content-presentation"
import { toArchiveSlug } from "./content-presentation"
