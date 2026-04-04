import type { Article, ArticleRevision, Prisma, User } from "@prisma/client"

import type { ArticleSummary } from "@/types/blog"
import { prisma } from "@/lib/prisma"

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

export type ManagedArticleInput = {
  title: string
  desc: string
  content: string
  category: string
  tags: string[]
  cover: string
  publishedAt: string
  draft: boolean
  slug?: string
}

export type ManagedArticleRevision = {
  id: string
  title: string
  desc: string
  category: string
  tags: string[]
  cover: string
  draft: boolean
  publishedAt: string
  content: string
  createdAt: string
  reason: string | null
  createdByName: string | null
}

function formatUserName(user: Pick<User, "name" | "email"> | null | undefined) {
  if (!user) {
    return null
  }

  return user.name?.trim() || user.email
}

function toManagedArticleSummary(record: Article): ManagedArticleSummary {
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

function toManagedArticleDetail(
  record: Article & {
    lastEditedBy: Pick<User, "name" | "email"> | null
  }
): ManagedArticleDetail {
  return {
    ...toManagedArticleSummary(record),
    content: record.content,
    lastEditedByName: formatUserName(record.lastEditedBy),
  }
}

function toManagedArticleRevision(
  record: ArticleRevision & {
    createdBy: Pick<User, "name" | "email"> | null
  }
): ManagedArticleRevision {
  return {
    id: record.id,
    title: record.title,
    desc: record.desc,
    category: record.category,
    tags: record.tags,
    cover: record.cover,
    draft: record.draft,
    publishedAt: record.publishedAt.toISOString(),
    content: record.content,
    createdAt: record.createdAt.toISOString(),
    reason: record.reason,
    createdByName: formatUserName(record.createdBy),
  }
}

function normalizeTags(tags: string[]) {
  return [...new Set(tags.map((tag) => tag.trim()).filter(Boolean))]
}

function buildSearchDocument(input: {
  title: string
  desc: string
  category: string
  tags: string[]
  content: string
}) {
  return [input.title, input.desc, input.category, input.tags.join(" "), input.content].join(" ").trim()
}

function normalizeArticleInput(input: ManagedArticleInput, options?: { requireSlug?: boolean }) {
  const title = input.title.trim()
  const desc = input.desc.trim()
  const content = input.content.trim()
  const category = input.category.trim()
  const cover = input.cover.trim()
  const tags = normalizeTags(input.tags)
  const slug = input.slug?.trim() ?? ""
  const publishedAt = new Date(input.publishedAt)

  if (!title || !desc || !content || !category || !cover || tags.length === 0 || Number.isNaN(publishedAt.getTime())) {
    throw new Error("INVALID_ARTICLE_INPUT")
  }

  if (options?.requireSlug && !slug) {
    throw new Error("INVALID_ARTICLE_INPUT")
  }

  return {
    title,
    desc,
    content,
    category,
    cover,
    tags,
    searchDocument: buildSearchDocument({ title, desc, category, tags, content }),
    draft: input.draft,
    slug,
    publishedAt,
  }
}

async function createRevisionSnapshot(
  tx: Prisma.TransactionClient,
  article: Article,
  editorUserId: string | null,
  reason?: string
) {
  await tx.articleRevision.create({
    data: {
      articleId: article.id,
      title: article.title,
      desc: article.desc,
      content: article.content,
      category: article.category,
      tags: article.tags,
      cover: article.cover,
      draft: article.draft,
      publishedAt: article.publishedAt,
      createdByUserId: editorUserId,
      reason,
    },
  })
}

export async function getManagedArticles() {
  const articles = await prisma.article.findMany({
    orderBy: {
      publishedAt: "desc",
    },
  })

  return articles.map(toManagedArticleSummary)
}

export async function getManagedArticleBySlug(slug: string) {
  const article = await prisma.article.findUnique({
    where: { slug },
    include: {
      lastEditedBy: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  })

  if (!article) {
    return null
  }

  return toManagedArticleDetail(article)
}

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

    await createRevisionSnapshot(tx, article, editorUserId, "Article created")
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

    await createRevisionSnapshot(tx, article, editorUserId, "Article updated")
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

    await createRevisionSnapshot(tx, updated, editorUserId, draft ? "Article hidden" : "Article published")
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

export async function getManagedTags() {
  const articles = await prisma.article.findMany({
    select: {
      slug: true,
      tags: true,
    },
  })

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
      const nextTags = normalizeTags(article.tags.map((tag) => (tag === sourceTag ? targetTag : tag)))
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
      await createRevisionSnapshot(tx, updated, editorUserId, `Tag renamed from ${sourceTag} to ${targetTag}`)
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

      await createRevisionSnapshot(tx, updated, editorUserId, `Tag removed: ${normalizedTag}`)
    }
  })
}

export async function getArticleRevisions(slug: string) {
  const article = await prisma.article.findUnique({
    where: { slug },
    select: { id: true },
  })

  if (!article) {
    return null
  }

  const revisions = await prisma.articleRevision.findMany({
    where: {
      articleId: article.id,
    },
    include: {
      createdBy: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return revisions.map(toManagedArticleRevision)
}

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

    await createRevisionSnapshot(tx, updated, editorUserId, `Restored revision ${revision.id}`)
    return updated
  })
}
