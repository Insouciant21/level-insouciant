import type { Article, Prisma } from "@prisma/client"

import { extractImageReferences } from "@/lib/media/references"

export type ArticleUrlReferenceCount = {
  contentReferenceCount: number
  coverReference: boolean
}

export function normalizeAssetUrl(url: string): string {
  const trimmed = url.trim()

  if (trimmed.endsWith("://")) {
    return trimmed
  }

  return trimmed.replace(/([^:])\/+$/, "$1")
}

export function collectArticleMediaUrlReferences(
  content: string,
  cover: string | null
): Map<string, ArticleUrlReferenceCount> {
  const refsByUrl = new Map<string, ArticleUrlReferenceCount>()

  if (content.includes("![")) {
    try {
      for (const reference of extractImageReferences(content)) {
        const normalizedUrl = normalizeAssetUrl(reference.url)
        if (!normalizedUrl) {
          continue
        }

        const existing = refsByUrl.get(normalizedUrl)
        if (existing) {
          existing.contentReferenceCount += reference.count
        } else {
          refsByUrl.set(normalizedUrl, {
            contentReferenceCount: reference.count,
            coverReference: false,
          })
        }
      }
    } catch {
      // Allow draft/in-progress MDX with syntax errors to save without failing.
    }
  }

  if (cover !== null) {
    const normalizedCover = normalizeAssetUrl(cover)
    if (normalizedCover) {
      const existing = refsByUrl.get(normalizedCover)
      if (existing) {
        existing.coverReference = true
      } else {
        refsByUrl.set(normalizedCover, {
          contentReferenceCount: 0,
          coverReference: true,
        })
      }
    }
  }

  return refsByUrl
}

export async function syncArticleMediaReferences(
  tx: Prisma.TransactionClient,
  article: Pick<Article, "id" | "content" | "cover">
): Promise<void> {
  const refsByUrl = collectArticleMediaUrlReferences(
    article.content,
    article.cover
  )

  await tx.articleMediaReference.deleteMany({
    where: { articleId: article.id },
  })

  if (refsByUrl.size === 0) {
    return
  }

  const candidateUrls = [
    ...new Set(
      [...refsByUrl.keys()].flatMap((url) =>
        url.endsWith("://") ? [url] : [url, `${url}/`]
      )
    ),
  ]

  const matchedAssets = await tx.mediaAsset.findMany({
    where: {
      publicUrl: { in: candidateUrls },
      status: { not: "DELETING" },
    },
    select: {
      id: true,
      publicUrl: true,
    },
  })

  if (matchedAssets.length === 0) {
    return
  }

  const rows = matchedAssets.flatMap((asset) => {
    const counts = refsByUrl.get(normalizeAssetUrl(asset.publicUrl))
    if (!counts) {
      return []
    }

    return [
      {
        articleId: article.id,
        mediaAssetId: asset.id,
        contentReferenceCount: counts.contentReferenceCount,
        coverReference: counts.coverReference,
      },
    ]
  })

  if (rows.length > 0) {
    await tx.articleMediaReference.createMany({
      data: rows,
    })
  }
}
