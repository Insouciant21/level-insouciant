import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"
import remarkMdx from "remark-mdx"
import remarkParse from "remark-parse"
import { unified } from "unified"
import { visit } from "unist-util-visit"

const mdxImageParser = unified()
  .use(remarkParse)
  .use(remarkMdx)
  .use(remarkGfm)
  .use(remarkMath, { singleDollarTextMath: true })

export function normalizeAssetUrl(url) {
  const trimmed = String(url ?? "").trim()

  if (trimmed.endsWith("://")) {
    return trimmed
  }

  return trimmed.replace(/([^:])\/+$/, "$1")
}

export function collectArticleMediaUrlReferences(content, cover) {
  const refsByUrl = new Map()

  if (typeof content === "string" && content.includes("![")) {
    try {
      const tree = mdxImageParser.parse(content)
      visit(tree, "image", (node) => {
        if (typeof node?.url !== "string") {
          return
        }

        const normalizedUrl = normalizeAssetUrl(node.url)
        if (!normalizedUrl) {
          return
        }

        const existing = refsByUrl.get(normalizedUrl)
        if (existing) {
          existing.contentReferenceCount += 1
        } else {
          refsByUrl.set(normalizedUrl, {
            contentReferenceCount: 1,
            coverReference: false,
          })
        }
      })
    } catch {
      // Ignore draft syntax errors during sync.
    }
  }

  if (typeof cover === "string" && cover.trim() !== "") {
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

export async function syncArticleMediaReferences(client, article, assetIdByNormalizedUrl) {
  const refsByUrl = collectArticleMediaUrlReferences(
    article.content,
    article.cover
  )

  let lookupMap = assetIdByNormalizedUrl

  if (!lookupMap && refsByUrl.size > 0) {
    const candidateUrls = [
      ...new Set(
        [...refsByUrl.keys()].flatMap((url) =>
          url.endsWith("://") ? [url] : [url, `${url}/`]
        )
      ),
    ]
    const matchedAssets = await client.mediaAsset.findMany({
      where: {
        publicUrl: { in: candidateUrls },
        status: { not: "DELETING" },
      },
      select: { id: true, publicUrl: true },
    })
    lookupMap = new Map(
      matchedAssets.map((asset) => [normalizeAssetUrl(asset.publicUrl), asset.id])
    )
  }

  const rows = []

  if (lookupMap) {
    for (const [normalizedUrl, counts] of refsByUrl.entries()) {
      const mediaAssetId = lookupMap.get(normalizedUrl)
      if (!mediaAssetId) {
        continue
      }

      rows.push({
        articleId: article.id,
        mediaAssetId,
        contentReferenceCount: counts.contentReferenceCount,
        coverReference: counts.coverReference,
      })
    }
  }

  await client.$transaction(async (tx) => {
    await tx.articleMediaReference.deleteMany({
      where: { articleId: article.id },
    })

    if (rows.length > 0) {
      await tx.articleMediaReference.createMany({ data: rows })
    }
  })
}
