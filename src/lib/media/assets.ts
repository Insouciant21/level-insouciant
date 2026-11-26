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
import { normalizeAssetUrl } from "@/lib/media/reference-sync"
import { removeImageReferences } from "@/lib/media/references"
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

const listableAssetStatuses: MediaAssetStatus[] = ["ACTIVE", "DELETE_FAILED"]

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
  const where: Prisma.MediaAssetWhereInput = {
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
    ...(status === "linked"
      ? {
          articleReferences: {
            some: {},
          },
        }
      : status === "unlinked"
        ? {
            articleReferences: {
              none: {},
            },
          }
        : {}),
  }

  const [assets, total] = await Promise.all([
    prisma.mediaAsset.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        _count: {
          select: {
            articleReferences: true,
          },
        },
      },
    }),
    prisma.mediaAsset.count({
      where,
    }),
  ])

  return {
    items: assets.map((asset) =>
      toMediaAssetSummary(asset, asset._count.articleReferences)
    ),
    page,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  }
}

export async function getMediaAssetDetails(
  id: string
): Promise<MediaAssetDetails | null> {
  const asset = await prisma.mediaAsset.findUnique({
    where: { id },
    include: {
      articleReferences: {
        orderBy: {
          article: {
            publishedAt: "desc",
          },
        },
        include: {
          article: {
            select: {
              id: true,
              slug: true,
              title: true,
              draft: true,
            },
          },
        },
      },
    },
  })

  if (!asset) {
    return null
  }

  const articles: MediaArticleReference[] = asset.articleReferences.map(
    (reference) => ({
      id: reference.article.id,
      slug: reference.article.slug,
      title: reference.article.title,
      draft: reference.article.draft,
      contentReferenceCount: reference.contentReferenceCount,
      coverReference: reference.coverReference,
    })
  )

  return {
    ...toMediaAssetSummary(asset, articles.length),
    articles,
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

  const asset = await prisma.mediaAsset.update({
    where: { id },
    data: { displayName: normalizedDisplayName },
    include: {
      _count: {
        select: {
          articleReferences: true,
        },
      },
    },
  })

  return toMediaAssetSummary(asset, asset._count.articleReferences)
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

  const linkedArticles = await prisma.article.findMany({
    where: {
      mediaReferences: {
        some: {
          mediaAssetId: id,
        },
      },
    },
    select: articleForMediaSelect,
  })
  const rewrites = await buildArticleRewrites(asset, linkedArticles)

  await prisma.$transaction(async (tx) => {
    await tx.mediaAsset.update({
      where: { id },
      data: { status: "DELETING" },
    })

    await tx.articleMediaReference.deleteMany({
      where: { mediaAssetId: id },
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
