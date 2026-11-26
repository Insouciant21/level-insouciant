import type {
  Article,
  MediaAsset as MediaAssetRecord,
  MediaAssetStatus,
  MediaProvider,
  Prisma,
} from "@prisma/client"

import {
  buildSearchDocument,
  createArticleRevisionSnapshot,
} from "@/lib/content-search"
import { prisma } from "@/lib/prisma"
import { invalidatePublicPages } from "@/server/public-page-cache"
import {
  extractImageReferences,
  removeImageReferences,
} from "@/lib/media/references"
import {
  createObjectKey,
  getActiveMediaProvider,
  getObjectStorageProvider,
} from "@/lib/media/storage"
import type { MediaProviderKey } from "@/lib/media/types"
import { validateImageFileMetadata } from "@/lib/media/validation"

export type MediaListStatus = "all" | "linked" | "unlinked"

export type MediaListQuery = {
  query?: string
  status?: MediaListStatus
  page?: number
  pageSize?: number
}

export type MediaArticleReference = {
  id: string
  slug: string
  title: string
  draft: boolean
  contentReferenceCount: number
  coverReference: boolean
}

export type MediaAssetSummary = {
  id: string
  displayName: string
  provider: MediaProviderKey
  objectKey: string
  publicUrl: string
  originalFilename: string
  mimeType: string
  sizeBytes: number
  status: string
  createdAt: string
  updatedAt: string
  linkedArticleCount: number
}

export type MediaAssetDetails = MediaAssetSummary & {
  articles: MediaArticleReference[]
}

export type MediaListResult = {
  items: MediaAssetSummary[]
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export type DeleteMediaResult = {
  assetId: string
  status: "DELETED" | "DELETE_FAILED"
  affectedArticleCount: number
}

type ArticleReferenceRecord = Pick<
  Article,
  "id" | "slug" | "title" | "content" | "cover" | "draft"
>

type ArticleForMedia = ArticleReferenceRecord &
  Pick<Article, "desc" | "category" | "tags" | "publishedAt">

type ArticleRewrite = {
  article: ArticleForMedia
  content: string
  cover: string | null
}

const articleReferenceSelect = {
  id: true,
  slug: true,
  title: true,
  content: true,
  cover: true,
  draft: true,
} as const

const articleForMediaSelect = {
  ...articleReferenceSelect,
  desc: true,
  category: true,
  tags: true,
  publishedAt: true,
} as const

const listableAssetStatuses: MediaAssetStatus[] = ["ACTIVE", "DELETE_FAILED"]
const MAX_ARTICLE_IMAGE_CACHE_ENTRIES = 1000
const EMPTY_IMAGE_COUNTS = new Map<string, number>()

type CachedArticleImageCounts = {
  content: string
  urlCounts: Map<string, number>
}

const articleImageCountCache = new Map<string, CachedArticleImageCounts>()

function normalizeAssetUrl(url: string): string {
  const trimmed = url.trim()

  if (trimmed.endsWith("://")) {
    return trimmed
  }

  return trimmed.replace(/([^:])\/+$/, "$1")
}

function getArticleContentImageCounts(
  article: Pick<ArticleReferenceRecord, "id" | "content">
): ReadonlyMap<string, number> {
  if (!article.content.includes("![")) {
    return EMPTY_IMAGE_COUNTS
  }

  const cached = articleImageCountCache.get(article.id)

  if (cached && cached.content === article.content) {
    articleImageCountCache.delete(article.id)
    articleImageCountCache.set(article.id, cached)
    return cached.urlCounts
  }

  const urlCounts = new Map<string, number>()

  try {
    for (const reference of extractImageReferences(article.content)) {
      const normalized = normalizeAssetUrl(reference.url)
      urlCounts.set(normalized, (urlCounts.get(normalized) ?? 0) + reference.count)
    }
  } catch {
    // Ignore unparseable MDX during listing/detail scans, matching non-strict behavior.
  }

  if (articleImageCountCache.size >= MAX_ARTICLE_IMAGE_CACHE_ENTRIES) {
    const oldestKey = articleImageCountCache.keys().next().value
    if (oldestKey !== undefined) {
      articleImageCountCache.delete(oldestKey)
    }
  }

  articleImageCountCache.set(article.id, {
    content: article.content,
    urlCounts,
  })

  return urlCounts
}

function buildUrlLinkedCountMap(
  articles: ArticleReferenceRecord[]
): Map<string, number> {
  const urlToLinkedCount = new Map<string, number>()

  for (const article of articles) {
    const seenUrls = new Set<string>()
    const contentCounts = getArticleContentImageCounts(article)

    for (const url of contentCounts.keys()) {
      seenUrls.add(url)
    }

    if (article.cover !== null) {
      seenUrls.add(normalizeAssetUrl(article.cover))
    }

    for (const url of seenUrls) {
      urlToLinkedCount.set(url, (urlToLinkedCount.get(url) ?? 0) + 1)
    }
  }

  return urlToLinkedCount
}

function toProviderKey(provider: MediaProvider): MediaProviderKey {
  const normalized = provider.toLowerCase()

  if (normalized === "oss" || normalized === "cos" || normalized === "r2") {
    return normalized
  }

  throw new Error("MEDIA_STORAGE_NOT_CONFIGURED")
}

function toMediaAssetSummary(
  asset: MediaAssetRecord,
  linkedArticleCount: number
): MediaAssetSummary {
  return {
    id: asset.id,
    displayName: asset.displayName,
    provider: toProviderKey(asset.provider),
    objectKey: asset.objectKey,
    publicUrl: asset.publicUrl,
    originalFilename: asset.originalFilename,
    mimeType: asset.mimeType,
    sizeBytes: asset.sizeBytes,
    status: asset.status,
    createdAt: asset.createdAt.toISOString(),
    updatedAt: asset.updatedAt.toISOString(),
    linkedArticleCount,
  }
}

function toMediaArticleReference(
  article: ArticleReferenceRecord,
  normalizedPublicUrl: string
): MediaArticleReference | null {
  const contentReferenceCount =
    getArticleContentImageCounts(article).get(normalizedPublicUrl) ?? 0
  const coverReference =
    article.cover !== null &&
    normalizeAssetUrl(article.cover) === normalizedPublicUrl

  if (contentReferenceCount === 0 && !coverReference) {
    return null
  }

  return {
    id: article.id,
    slug: article.slug,
    title: article.title,
    draft: article.draft,
    contentReferenceCount,
    coverReference,
  }
}

function getMediaArticleReferences(
  asset: MediaAssetRecord,
  articles: ArticleReferenceRecord[]
): MediaArticleReference[] {
  const normalizedPublicUrl = normalizeAssetUrl(asset.publicUrl)

  return articles.flatMap((article) => {
    const reference = toMediaArticleReference(article, normalizedPublicUrl)
    return reference ? [reference] : []
  })
}

async function findArticleReferences(): Promise<ArticleReferenceRecord[]> {
  return prisma.article.findMany({
    select: articleReferenceSelect,
  })
}

async function findArticlesForMedia(): Promise<ArticleForMedia[]> {
  return prisma.article.findMany({
    select: articleForMediaSelect,
  })
}

function clampPage(value: number | undefined, fallback: number): number {
  if (!Number.isFinite(value)) {
    return fallback
  }

  return Math.max(1, Math.floor(value as number))
}

function clampPageSize(value: number | undefined): number {
  if (!Number.isFinite(value)) {
    return 24
  }

  return Math.min(100, Math.max(1, Math.floor(value as number)))
}

export async function listMediaAssets(
  query: MediaListQuery = {}
): Promise<MediaListResult> {
  const normalizedQuery = query.query?.trim() ?? ""
  const status = query.status ?? "all"
  const page = clampPage(query.page, 1)
  const pageSize = clampPageSize(query.pageSize)
  const assetWhere: Prisma.MediaAssetWhereInput = {
    status: {
      in: listableAssetStatuses,
    },
    ...(normalizedQuery
      ? {
          displayName: {
            contains: normalizedQuery,
            mode: "insensitive",
          },
        }
      : {}),
  }

  if (status === "all") {
    const [assets, total] = await Promise.all([
      prisma.mediaAsset.findMany({
        where: assetWhere,
        orderBy: {
          createdAt: "desc",
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.mediaAsset.count({
        where: assetWhere,
      }),
    ])

    const urlToLinkedCount =
      assets.length > 0
        ? buildUrlLinkedCountMap(await findArticleReferences())
        : new Map<string, number>()

    return {
      items: assets.map((asset) =>
        toMediaAssetSummary(
          asset,
          urlToLinkedCount.get(normalizeAssetUrl(asset.publicUrl)) ?? 0
        )
      ),
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    }
  }

  const [assets, articles] = await Promise.all([
    prisma.mediaAsset.findMany({
      where: assetWhere,
      orderBy: {
        createdAt: "desc",
      },
    }),
    findArticleReferences(),
  ])
  const urlToLinkedCount = buildUrlLinkedCountMap(articles)
  const filtered = assets.flatMap((asset) => {
    const linkedArticleCount =
      urlToLinkedCount.get(normalizeAssetUrl(asset.publicUrl)) ?? 0
    const matchesStatus =
      status === "linked" ? linkedArticleCount > 0 : linkedArticleCount === 0

    return matchesStatus ? [{ asset, linkedArticleCount }] : []
  })
  const total = filtered.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const start = (page - 1) * pageSize

  return {
    items: filtered
      .slice(start, start + pageSize)
      .map(({ asset, linkedArticleCount }) =>
        toMediaAssetSummary(asset, linkedArticleCount)
      ),
    page,
    pageSize,
    total,
    totalPages,
  }
}

export async function getMediaAssetDetails(
  id: string
): Promise<MediaAssetDetails | null> {
  const asset = await prisma.mediaAsset.findUnique({
    where: { id },
  })

  if (!asset) {
    return null
  }

  const articles = await findArticleReferences()
  const references = getMediaArticleReferences(asset, articles)

  return {
    ...toMediaAssetSummary(asset, references.length),
    articles: references,
  }
}

export async function createMediaAsset(input: {
  file: File
  uploadedByUserId: string
}): Promise<MediaAssetSummary> {
  const contentType = validateImageFileMetadata({
    filename: input.file.name,
    mimeType: input.file.type,
    sizeBytes: input.file.size,
  })
  const objectKey = createObjectKey(input.file.name)
  const providerKey = getActiveMediaProvider()
  const storage = getObjectStorageProvider(providerKey)
  const body = Buffer.from(await input.file.arrayBuffer())

  await storage.upload({ objectKey, body, contentType })

  try {
    const asset = await prisma.mediaAsset.create({
      data: {
        displayName: input.file.name.trim(),
        provider: providerKey.toUpperCase() as MediaProvider,
        objectKey,
        publicUrl: storage.publicUrl(objectKey),
        originalFilename: input.file.name,
        mimeType: contentType,
        sizeBytes: input.file.size,
        uploadedByUserId: input.uploadedByUserId,
      },
    })

    return toMediaAssetSummary(asset, 0)
  } catch (error) {
    await storage.delete(objectKey).catch(() => undefined)
    throw error
  }
}

export async function renameMediaAsset(
  id: string,
  displayName: string
): Promise<MediaAssetSummary> {
  const normalizedDisplayName = displayName.trim()

  if (!normalizedDisplayName) {
    throw new Error("INVALID_MEDIA_DISPLAY_NAME")
  }

  const existing = await prisma.mediaAsset.findUnique({
    where: { id },
  })

  if (!existing) {
    throw new Error("MEDIA_ASSET_NOT_FOUND")
  }

  if (existing.status === "DELETING") {
    throw new Error("MEDIA_ASSET_NOT_AVAILABLE")
  }

  const [asset, articles] = await Promise.all([
    prisma.mediaAsset.update({
      where: { id },
      data: { displayName: normalizedDisplayName },
    }),
    findArticleReferences(),
  ])
  const references = getMediaArticleReferences(asset, articles)

  return toMediaAssetSummary(asset, references.length)
}

async function buildArticleRewrites(
  asset: MediaAssetRecord,
  articles: ArticleForMedia[]
): Promise<ArticleRewrite[]> {
  return articles.flatMap((article) => {
    let rewrittenContent: string

    try {
      rewrittenContent = removeImageReferences(
        article.content,
        asset.publicUrl
      ).source
    } catch {
      throw new Error("MEDIA_REFERENCE_REWRITE_FAILED")
    }

    const coverMatches =
      article.cover !== null &&
      normalizeAssetUrl(article.cover) === normalizeAssetUrl(asset.publicUrl)

    if (rewrittenContent === article.content && !coverMatches) {
      return []
    }

    return [
      {
        article,
        content: rewrittenContent,
        cover: coverMatches ? null : article.cover,
      },
    ]
  })
}

export async function deleteMediaAsset(
  id: string,
  editorUserId: string
): Promise<DeleteMediaResult> {
  const asset = await prisma.mediaAsset.findUnique({
    where: { id },
  })

  if (!asset) {
    throw new Error("MEDIA_ASSET_NOT_FOUND")
  }

  if (asset.status === "DELETING") {
    throw new Error("MEDIA_ASSET_NOT_AVAILABLE")
  }

  const articles = await findArticlesForMedia()
  const rewrites = await buildArticleRewrites(asset, articles)

  await prisma.$transaction(async (tx) => {
    await tx.mediaAsset.update({
      where: { id },
      data: { status: "DELETING" },
    })

    for (const rewrite of rewrites) {
      const updated = await tx.article.update({
        where: { id: rewrite.article.id },
        data: {
          content: rewrite.content,
          cover: rewrite.cover,
          searchDocument: buildSearchDocument({
            title: rewrite.article.title,
            desc: rewrite.article.desc,
            category: rewrite.article.category,
            tags: rewrite.article.tags,
            content: rewrite.content,
          }),
          lastEditedByUserId: editorUserId,
        },
      })

      await createArticleRevisionSnapshot(
        tx,
        updated,
        editorUserId,
        `Media asset deleted: ${asset.displayName}`
      )
    }
  })

  if (rewrites.length > 0) invalidatePublicPages()

  try {
    const storage = getObjectStorageProvider(toProviderKey(asset.provider))
    await storage.delete(asset.objectKey)
    await prisma.mediaAsset.delete({
      where: { id },
    })

    return {
      assetId: id,
      status: "DELETED",
      affectedArticleCount: rewrites.length,
    }
  } catch {
    await prisma.mediaAsset.update({
      where: { id },
      data: { status: "DELETE_FAILED" },
    })

    return {
      assetId: id,
      status: "DELETE_FAILED",
      affectedArticleCount: rewrites.length,
    }
  }
}

export async function retryMediaAssetDeletion(
  id: string
): Promise<DeleteMediaResult> {
  const asset = await prisma.mediaAsset.findUnique({
    where: { id },
  })

  if (!asset) {
    throw new Error("MEDIA_ASSET_NOT_FOUND")
  }

  if (asset.status !== "DELETE_FAILED") {
    throw new Error("MEDIA_ASSET_NOT_RETRYABLE")
  }

  const storage = getObjectStorageProvider(toProviderKey(asset.provider))

  try {
    await storage.delete(asset.objectKey)
    await prisma.mediaAsset.delete({
      where: { id },
    })

    return {
      assetId: id,
      status: "DELETED",
      affectedArticleCount: 0,
    }
  } catch {
    await prisma.mediaAsset.update({
      where: { id },
      data: { status: "DELETE_FAILED" },
    })

    return {
      assetId: id,
      status: "DELETE_FAILED",
      affectedArticleCount: 0,
    }
  }
}
