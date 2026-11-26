import { beforeEach, describe, expect, it, vi } from "vitest"

import {
  collectArticleMediaUrlReferences,
  normalizeAssetUrl,
  syncArticleMediaReferences,
} from "@/lib/media/reference-sync"

const tx = {
  mediaAsset: {
    findMany: vi.fn(),
  },
  articleMediaReference: {
    deleteMany: vi.fn(),
    createMany: vi.fn(),
  },
}

beforeEach(() => {
  vi.clearAllMocks()
  tx.mediaAsset.findMany.mockResolvedValue([])
  tx.articleMediaReference.deleteMany.mockResolvedValue({ count: 0 })
  tx.articleMediaReference.createMany.mockResolvedValue({ count: 0 })
})

describe("article media reference sync", () => {
  it("normalizes trailing slashes without stripping protocol", () => {
    expect(normalizeAssetUrl("https://cdn.example.com/a.png/")).toBe(
      "https://cdn.example.com/a.png"
    )
    expect(normalizeAssetUrl("https://")).toBe("https://")
  })

  it("collects content and cover references while ignoring broken MDX", () => {
    const refs = collectArticleMediaUrlReferences(
      [
        "![one](https://cdn.example.com/a.png)",
        "![two](https://cdn.example.com/a.png/)",
        "```md",
        "![code](https://cdn.example.com/ignored.png)",
        "```",
      ].join("\n\n"),
      "https://cdn.example.com/a.png"
    )

    expect(refs.get("https://cdn.example.com/a.png")).toEqual({
      contentReferenceCount: 2,
      coverReference: true,
    })
    expect(refs.has("https://cdn.example.com/ignored.png")).toBe(false)

    const fallbackRefs = collectArticleMediaUrlReferences(
      "<Broken ![x](https://cdn.example.com/a.png)",
      "https://cdn.example.com/cover.png/"
    )
    expect(fallbackRefs.get("https://cdn.example.com/cover.png")).toEqual({
      contentReferenceCount: 0,
      coverReference: true,
    })
  })

  it("syncs matched MediaAsset rows inside the transaction", async () => {
    tx.mediaAsset.findMany.mockResolvedValue([
      {
        id: "asset-1",
        publicUrl: "https://cdn.example.com/a.png",
      },
    ])

    await syncArticleMediaReferences(tx as never, {
      id: "article-1",
      content: "![one](https://cdn.example.com/a.png)\n![ext](https://other.example.com/b.png)",
      cover: "https://cdn.example.com/a.png/",
    })

    expect(tx.articleMediaReference.deleteMany).toHaveBeenCalledWith({
      where: { articleId: "article-1" },
    })
    expect(tx.mediaAsset.findMany).toHaveBeenCalledWith({
      where: {
        publicUrl: {
          in: [
            "https://cdn.example.com/a.png",
            "https://cdn.example.com/a.png/",
            "https://other.example.com/b.png",
            "https://other.example.com/b.png/",
          ],
        },
        status: { not: "DELETING" },
      },
      select: {
        id: true,
        publicUrl: true,
      },
    })
    expect(tx.articleMediaReference.createMany).toHaveBeenCalledWith({
      data: [
        {
          articleId: "article-1",
          mediaAssetId: "asset-1",
          contentReferenceCount: 1,
          coverReference: true,
        },
      ],
    })
  })

  it("clears existing references without querying assets when article has no images", async () => {
    await syncArticleMediaReferences(tx as never, {
      id: "article-1",
      content: "Plain text without images",
      cover: null,
    })

    expect(tx.articleMediaReference.deleteMany).toHaveBeenCalledWith({
      where: { articleId: "article-1" },
    })
    expect(tx.mediaAsset.findMany).not.toHaveBeenCalled()
    expect(tx.articleMediaReference.createMany).not.toHaveBeenCalled()
  })
})
