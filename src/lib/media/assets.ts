import type {
  Article,
  MediaAsset as MediaAssetRecord,
  MediaAssetStatus,
  MediaProvider,
} from "@prisma/client"

import {
  buildSearchDocument,
  createArticleRevisionSnapshot,
} from "@/lib/content-search"
import { prisma } from "@/lib/prisma"
import { invalidatePublicPages } from "@/server/public-page-cache"
import {
  countImageReference,
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

type ArticleForMedia = Pick<
  Article,
  | "id"
  | "slug"
  | "title"
  | "desc"
  | "category"
  | "tags"
  | "content"
  | "cover"
  | "draft"
  | "publishedAt"
>

type ArticleRewrite = {
  article: ArticleForMedia
  content: string
  cover: string | null
}

const articleForMediaSelect = {
  id: true,
  slug: true,
  title: true,
  desc: true,
  category: true,
  tags: true,
  content: true,
  cover: true,
  draft: true,
  publishedAt: true,
} as const

const listableAssetStatuses: MediaAssetStatus[] = [
  "ACTIVE",
  "DELETE_FAILED",
]

function normalizeAssetUrl(url: string): string {
  const trimmed = url.trim()

  if (trimmed.endsWith("://")) {
    return trimmed
  }

  return trimmed.replace(/([^:])\/+$/, "$1")
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
  articles: MediaArticleReference[]
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
    linkedArticleCount: articles.length,
  }
}

function toMediaArticleReference(
  article: ArticleForMedia,
  publicUrl: string,
  options?: { strict?: boolean }
): MediaArticleReference | null {
  let contentReferenceCount = 0

  try {
    contentReferenceCount = countImageReference(article.content, publicUrl)
  } catch {
    if (options?.strict) {
      throw new Error("MEDIA_REFERENCE_REWRITE_FAILED")
    }
  }

  const coverReference =
    article.cover !== null &&
    normalizeAssetUrl(article.cover) === normalizeAssetUrl(publicUrl)

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
  articles: ArticleForMedia[],
  options?: { strict?: boolean }
): MediaArticleReference[] {
  return articles.flatMap((article) => {
    const reference = toMediaArticleReference(article, asset.publicUrl, options)
    return reference ? [reference] : []
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
  const [assets, articles] = await Promise.all([
    prisma.mediaAsset.findMany({
      where: {
        status: {
          in: listableAssetStatuses,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
    findArticlesForMedia(),
  ])
  const normalizedQuery = query.query?.trim().toLowerCase() ?? ""
  const status = query.status ?? "all"
  const filtered = assets
    .map((asset) => {
      const references = getMediaArticleReferences(asset, articles)
      return {
        asset,
        references,
      }
    })
    .filter(({ asset, references }) => {
      if (
        normalizedQuery &&
        !asset.displayName.toLowerCase().includes(normalizedQuery)
      ) {
        return false
      }

      if (status === "linked") {
        return references.length > 0
      }

      if (status === "unlinked") {
        return references.length === 0
      }

      return true
    })
  const page = clampPage(query.page, 1)
  const pageSize = clampPageSize(query.pageSize)
  const total = filtered.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const start = (page - 1) * pageSize

  return {
    items: filtered
      .slice(start, start + pageSize)
      .map(({ asset, references }) =>
        toMediaAssetSummary(asset, references)
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

  const articles = await findArticlesForMedia()
  const references = getMediaArticleReferences(asset, articles)

  return {
    ...toMediaAssetSummary(asset, references),
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

    return toMediaAssetSummary(asset, [])
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

  const asset = await prisma.mediaAsset.update({
    where: { id },
    data: { displayName: normalizedDisplayName },
  })
  const articles = await findArticlesForMedia()
  const references = getMediaArticleReferences(asset, articles)

  return toMediaAssetSummary(asset, references)
}

async function buildArticleRewrites(
  asset: MediaAssetRecord,
  articles: ArticleForMedia[]
): Promise<ArticleRewrite[]> {
  return articles.flatMap((article) => {
    let rewrittenContent: string

    try {
      rewrittenContent = removeImageReferences(article.content, asset.publicUrl).source
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
