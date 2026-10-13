import type { Prisma, User } from "@prisma/client"
import { cache } from "@/server/request-context"

import type { ArticleSummary } from "@/types/blog"
import {
  buildSearchDocument,
  createArticleRevisionSnapshot,
} from "@/lib/content-search"
import { prisma } from "@/lib/prisma"
import {
  managedArticleInputSchema,
  type ManagedArticleInput,
} from "@/lib/validation/article"

export type ManagedArticleSummary = ArticleSummary & {
  id: string
  createdAt: string
  updatedAt: string
  legacySourcePath: string | null
}

export type ManagedArticleDetail = ManagedArticleSummary & {
  content: string
  lastEditedByName: string | null
}

export type { ManagedArticleInput }

export type ManagedArticleRevisionSummary = {
  id: string
  title: string
  desc: string
  category: string
  tags: string[]
  cover: string | null
  draft: boolean
  publishedAt: string
  createdAt: string
  reason: string | null
  createdByName: string | null
}

export type ManagedArticleRevisionHistory = {
  article: ManagedArticleSummary
  revisions: ManagedArticleRevisionSummary[]
}

const userNameSelect = {
  name: true,
  email: true,
} satisfies Prisma.UserSelect

const managedArticleSummarySelect = {
  id: true,
  slug: true,
  title: true,
  desc: true,
  publishedAt: true,
  tags: true,
  category: true,
  cover: true,
  draft: true,
  createdAt: true,
  updatedAt: true,
  legacySourcePath: true,
} satisfies Prisma.ArticleSelect

const managedArticleTagSelect = {
  slug: true,
  tags: true,
} satisfies Prisma.ArticleSelect

const managedArticleDetailSelect = {
  ...managedArticleSummarySelect,
  content: true,
  lastEditedBy: {
    select: userNameSelect,
  },
} satisfies Prisma.ArticleSelect

const managedArticleRevisionSummarySelect = {
  id: true,
  title: true,
  desc: true,
  category: true,
  tags: true,
  cover: true,
  draft: true,
  publishedAt: true,
  createdAt: true,
  reason: true,
  createdBy: {
    select: userNameSelect,
  },
} satisfies Prisma.ArticleRevisionSelect

type ManagedArticleSummaryRecord = Prisma.ArticleGetPayload<{
  select: typeof managedArticleSummarySelect
}>

type ManagedArticleDetailRecord = Prisma.ArticleGetPayload<{
  select: typeof managedArticleDetailSelect
}>

type ManagedArticleTagRecord = Prisma.ArticleGetPayload<{
  select: typeof managedArticleTagSelect
}>

type ManagedArticleRevisionSummaryRecord = Prisma.ArticleRevisionGetPayload<{
  select: typeof managedArticleRevisionSummarySelect
}>

function formatUserName(user: Pick<User, "name" | "email"> | null | undefined) {
  if (!user) {
    return null
  }

  return user.name?.trim() || user.email
}

function toManagedArticleSummary(record: ManagedArticleSummaryRecord): ManagedArticleSummary {
  return {
    id: record.id,
    slug: record.slug,
    title: record.title,
    desc: record.desc,
    date: record.publishedAt.toISOString(),
    tags: record.tags,
    category: record.category,
    cover: record.cover,
    draft: record.draft,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
    legacySourcePath: record.legacySourcePath,
  }
}

function toManagedArticleDetail(record: ManagedArticleDetailRecord): ManagedArticleDetail {
  return {
    ...toManagedArticleSummary(record),
    content: record.content,
    lastEditedByName: formatUserName(record.lastEditedBy),
  }
}

function buildManagedTagsFromArticles(articles: ManagedArticleTagRecord[]) {
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

function toManagedArticleRevisionSummary(
  record: ManagedArticleRevisionSummaryRecord
): ManagedArticleRevisionSummary {
  return {
    id: record.id,
    title: record.title,
    desc: record.desc,
    category: record.category,
    tags: record.tags,
    cover: record.cover,
    draft: record.draft,
    publishedAt: record.publishedAt.toISOString(),
    createdAt: record.createdAt.toISOString(),
    reason: record.reason,
    createdByName: formatUserName(record.createdBy),
  }
}

function deduplicateTags(tags: string[]) {
  return [...new Set(tags.map((tag) => tag.trim()).filter(Boolean))]
}

function normalizeArticleInput(input: ManagedArticleInput, options?: { requireSlug?: boolean }) {
  const result = managedArticleInputSchema.safeParse(input)

  if (!result.success) {
    throw new Error("INVALID_ARTICLE_INPUT")
  }

  const normalized = result.data

  if (options?.requireSlug && !normalized.slug) {
    throw new Error("INVALID_ARTICLE_INPUT")
  }

  return {
    title: normalized.title,
    desc: normalized.desc,
    content: normalized.content,
    category: normalized.category,
    cover: normalized.cover || null,
    tags: normalized.tags,
    searchDocument: buildSearchDocument(normalized),
    draft: normalized.draft,
    slug: normalized.slug,
    publishedAt: new Date(normalized.publishedAt),
  }
}

export const getManagedArticles = cache(async function getManagedArticles() {
  const articles = await prisma.article.findMany({
    orderBy: {
      publishedAt: "desc",
    },
    select: managedArticleSummarySelect,
  })

  return articles.map(toManagedArticleSummary)
})

export const getManagedArticleBySlug = cache(async function getManagedArticleBySlug(slug: string) {
  const article = await prisma.article.findUnique({
    where: { slug },
    select: managedArticleDetailSelect,
  })

  if (!article) {
    return null
  }

  return toManagedArticleDetail(article)
})

export async function createManagedArticle(input: ManagedArticleInput, editorUserId: string) {
  const normalized = normalizeArticleInput(input, { requireSlug: true })
  const existing = await prisma.article.findUnique({
    where: { slug: normalized.slug },
    select: { id: true },
  })

  if (existing) {
    throw new Error("ARTICLE_SLUG_TAKEN")
  }

  return prisma.$transaction(async (tx) => {
    const article = await tx.article.create({
      data: {
        slug: normalized.slug,
        title: normalized.title,
        desc: normalized.desc,
        content: normalized.content,
        category: normalized.category,
        tags: normalized.tags,
        cover: normalized.cover,
        searchDocument: normalized.searchDocument,
        draft: normalized.draft,
        publishedAt: normalized.publishedAt,
        lastEditedByUserId: editorUserId,
      },
    })

    await createArticleRevisionSnapshot(tx, article, editorUserId, "Article created")
    return article
  })
}

export async function updateManagedArticle(slug: string, input: ManagedArticleInput, editorUserId: string) {
  const normalized = normalizeArticleInput(input)
  const existing = await prisma.article.findUnique({
    where: { slug },
  })

  if (!existing) {
    throw new Error("ARTICLE_NOT_FOUND")
  }

  return prisma.$transaction(async (tx) => {
    const article = await tx.article.update({
      where: { slug },
      data: {
        title: normalized.title,
        desc: normalized.desc,
        content: normalized.content,
        category: normalized.category,
        tags: normalized.tags,
        cover: normalized.cover,
        searchDocument: normalized.searchDocument,
        draft: normalized.draft,
        publishedAt: normalized.publishedAt,
        lastEditedByUserId: editorUserId,
      },
    })

    await createArticleRevisionSnapshot(tx, article, editorUserId, "Article updated")
    return article
  })
}

export async function setArticleDraftState(slug: string, draft: boolean, editorUserId: string) {
  const article = await prisma.article.findUnique({
    where: { slug },
  })

  if (!article) {
    throw new Error("ARTICLE_NOT_FOUND")
  }

  return prisma.$transaction(async (tx) => {
    const updated = await tx.article.update({
      where: { slug },
      data: {
        draft,
        lastEditedByUserId: editorUserId,
      },
    })

    await createArticleRevisionSnapshot(
      tx,
      updated,
      editorUserId,
      draft ? "Article hidden" : "Article published"
    )
    return updated
  })
}

export async function deleteArticleBySlug(slug: string) {
  const article = await prisma.article.findUnique({
    where: { slug },
  })

  if (!article) {
    throw new Error("ARTICLE_NOT_FOUND")
  }

  await prisma.$transaction([
    prisma.pageView.deleteMany({
      where: { articleSlug: slug },
    }),
    prisma.articleLike.deleteMany({
      where: { articleSlug: slug },
    }),
    prisma.comment.deleteMany({
      where: { articleSlug: slug },
    }),
    prisma.articleRevision.deleteMany({
      where: { articleId: article.id },
    }),
    prisma.article.delete({
      where: { slug },
    }),
  ])
}

export type ManagedTagSummary = {
  name: string
  count: number
  articleSlugs: string[]
}

export const getManagedTags = cache(async function getManagedTags() {
  const articles = await prisma.article.findMany({
    select: managedArticleTagSelect,
  })

  return buildManagedTagsFromArticles(articles)
})

export async function renameTagAcrossArticles(fromTag: string, toTag: string, editorUserId: string) {
  const sourceTag = fromTag.trim()
  const targetTag = toTag.trim()

  if (!sourceTag || !targetTag) {
    throw new Error("INVALID_TAG")
  }

  const articles = await prisma.article.findMany({
    where: {
      tags: {
        has: sourceTag,
      },
    },
  })

  await prisma.$transaction(async (tx) => {
    for (const article of articles) {
      const nextTags = deduplicateTags(
        article.tags.map((tag) => (tag === sourceTag ? targetTag : tag))
      )
      const updated = await tx.article.update({
        where: { id: article.id },
        data: {
          tags: nextTags,
          searchDocument: buildSearchDocument({
            title: article.title,
            desc: article.desc,
            category: article.category,
            tags: nextTags,
            content: article.content,
          }),
          lastEditedByUserId: editorUserId,
        },
      })
      await createArticleRevisionSnapshot(
        tx,
        updated,
        editorUserId,
        `Tag renamed from ${sourceTag} to ${targetTag}`
      )
    }
  })
}

export async function removeTagAcrossArticles(tagToRemove: string, editorUserId: string) {
  const normalizedTag = tagToRemove.trim()

  if (!normalizedTag) {
    throw new Error("INVALID_TAG")
  }

  const articles = await prisma.article.findMany({
    where: {
      tags: {
        has: normalizedTag,
      },
    },
  })

  await prisma.$transaction(async (tx) => {
    for (const article of articles) {
      const nextTags = article.tags.filter((tag) => tag !== normalizedTag)
      const updated = await tx.article.update({
        where: { id: article.id },
        data: {
          tags: nextTags,
          searchDocument: buildSearchDocument({
            title: article.title,
            desc: article.desc,
            category: article.category,
            tags: nextTags,
            content: article.content,
          }),
          lastEditedByUserId: editorUserId,
        },
      })

      await createArticleRevisionSnapshot(
        tx,
        updated,
        editorUserId,
        `Tag removed: ${normalizedTag}`
      )
    }
  })
}

export const getArticleRevisionHistory = cache(async function getArticleRevisionHistory(
  slug: string
): Promise<ManagedArticleRevisionHistory | null> {
  const article = await prisma.article.findUnique({
    where: { slug },
    select: {
      ...managedArticleSummarySelect,
      revisions: {
        select: managedArticleRevisionSummarySelect,
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  })

  if (!article) {
    return null
  }

  return {
    article: toManagedArticleSummary(article),
    revisions: article.revisions.map(toManagedArticleRevisionSummary),
  }
})

export const getArticleRevisionBody = cache(async function getArticleRevisionBody(slug: string, revisionId: string) {
  const revision = await prisma.articleRevision.findFirst({
    where: {
      id: revisionId,
      article: {
        is: {
          slug,
        },
      },
    },
    select: {
      content: true,
    },
  })

  return revision
})

export async function restoreArticleRevision(slug: string, revisionId: string, editorUserId: string) {
  const article = await prisma.article.findUnique({
    where: { slug },
  })

  if (!article) {
    throw new Error("ARTICLE_NOT_FOUND")
  }

  const revision = await prisma.articleRevision.findFirst({
    where: {
      id: revisionId,
      articleId: article.id,
    },
  })

  if (!revision) {
    throw new Error("REVISION_NOT_FOUND")
  }

  return prisma.$transaction(async (tx) => {
    const updated = await tx.article.update({
      where: { id: article.id },
      data: {
        title: revision.title,
        desc: revision.desc,
        content: revision.content,
        category: revision.category,
        tags: revision.tags,
        cover: revision.cover,
        searchDocument: buildSearchDocument({
          title: revision.title,
          desc: revision.desc,
          category: revision.category,
          tags: revision.tags,
          content: revision.content,
        }),
        draft: revision.draft,
        publishedAt: revision.publishedAt,
        lastEditedByUserId: editorUserId,
      },
    })

    await createArticleRevisionSnapshot(
      tx,
      updated,
      editorUserId,
      `Restored revision ${revision.id}`
    )
    return updated
  })
}
