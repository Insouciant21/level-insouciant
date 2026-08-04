import { beforeEach, describe, expect, it, vi } from "vitest"

import { prisma } from "@/lib/prisma"
import {
  createMediaAsset,
  deleteMediaAsset,
  listMediaAssets,
  renameMediaAsset,
  retryMediaAssetDeletion,
} from "@/lib/media/assets"
import {
  createObjectKey,
  getActiveMediaProvider,
  getObjectStorageProvider,
} from "@/lib/media/storage"

vi.mock("@/lib/prisma", () => ({
  prisma: {
    mediaAsset: {
      create: vi.fn(),
      delete: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    article: {
      findMany: vi.fn(),
      update: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}))

vi.mock("@/lib/media/storage", () => ({
  createObjectKey: vi.fn(),
  getActiveMediaProvider: vi.fn(),
  getObjectStorageProvider: vi.fn(),
}))

const asset = {
  id: "asset-1",
  displayName: "screen.png",
  provider: "R2",
  objectKey: "images/2026/08/object.png",
  publicUrl: "https://cdn.example.com/images/object.png",
  originalFilename: "screen.png",
  mimeType: "image/png",
  sizeBytes: 5,
  status: "ACTIVE",
  uploadedByUserId: "admin-1",
  createdAt: new Date("2026-08-04T00:00:00.000Z"),
  updatedAt: new Date("2026-08-04T00:00:00.000Z"),
}

const article = {
  id: "article-1",
  slug: "first-article",
  title: "First article",
  desc: "Description",
  category: "Notes",
  tags: ["tag"],
  content: `Intro\n\n![Screen](${asset.publicUrl})\n`,
  cover: asset.publicUrl,
  draft: false,
  publishedAt: new Date("2026-08-03T00:00:00.000Z"),
}

const storageProvider = {
  upload: vi.fn(),
  delete: vi.fn(),
  publicUrl: vi.fn(),
}

const tx = {
  mediaAsset: {
    update: vi.fn(),
  },
  article: {
    update: vi.fn(),
  },
  articleRevision: {
    create: vi.fn(),
  },
}

function resetMocks() {
  vi.clearAllMocks()
  vi.mocked(createObjectKey).mockReturnValue(asset.objectKey)
  vi.mocked(getActiveMediaProvider).mockReturnValue("r2")
  vi.mocked(getObjectStorageProvider).mockReturnValue(storageProvider)
  storageProvider.publicUrl.mockReturnValue(asset.publicUrl)
  storageProvider.upload.mockResolvedValue(undefined)
  storageProvider.delete.mockResolvedValue(undefined)
  vi.mocked(prisma.$transaction).mockImplementation(async (callback) =>
    callback(tx as never)
  )
  tx.mediaAsset.update.mockResolvedValue({ ...asset, status: "DELETING" })
  tx.article.update.mockResolvedValue({ ...article, content: "Intro\n" })
  tx.articleRevision.create.mockResolvedValue({})
}

beforeEach(resetMocks)

describe("media asset service", () => {
  it("uploads before creating the database record", async () => {
    vi.mocked(prisma.mediaAsset.create).mockResolvedValue(asset as never)

    const file = new File([Buffer.from("image")], "screen.png", {
      type: "image/png",
    })
    const result = await createMediaAsset({ file, uploadedByUserId: "admin-1" })

    expect(storageProvider.upload).toHaveBeenCalledWith({
      objectKey: asset.objectKey,
      body: Buffer.from("image"),
      contentType: "image/png",
    })
    expect(prisma.mediaAsset.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        displayName: "screen.png",
        provider: "R2",
        objectKey: asset.objectKey,
        publicUrl: asset.publicUrl,
        uploadedByUserId: "admin-1",
      }),
    })
    expect(storageProvider.upload.mock.invocationCallOrder[0]).toBeLessThan(
      vi.mocked(prisma.mediaAsset.create).mock.invocationCallOrder[0] ?? 0
    )
    expect(result.id).toBe(asset.id)
  })

  it("cleans up the uploaded object when database creation fails", async () => {
    vi.mocked(prisma.mediaAsset.create).mockRejectedValue(new Error("db down"))

    const file = new File([Buffer.from("image")], "screen.png", {
      type: "image/png",
    })

    await expect(
      createMediaAsset({ file, uploadedByUserId: "admin-1" })
    ).rejects.toThrow("db down")
    expect(storageProvider.delete).toHaveBeenCalledWith(asset.objectKey)
  })

  it("renames only the display name", async () => {
    vi.mocked(prisma.mediaAsset.findUnique).mockResolvedValue(asset as never)
    vi.mocked(prisma.mediaAsset.update).mockResolvedValue({
      ...asset,
      displayName: "Renamed screen",
    } as never)
    vi.mocked(prisma.article.findMany).mockResolvedValue([article] as never)

    const result = await renameMediaAsset("asset-1", "  Renamed screen  ")

    expect(prisma.mediaAsset.update).toHaveBeenCalledWith({
      where: { id: "asset-1" },
      data: { displayName: "Renamed screen" },
    })
    expect(result).toMatchObject({
      displayName: "Renamed screen",
      objectKey: asset.objectKey,
      publicUrl: asset.publicUrl,
    })
  })

  it("lists assets with linked and unlinked filters", async () => {
    vi.mocked(prisma.mediaAsset.findMany).mockResolvedValue([
      asset,
      { ...asset, id: "asset-2", displayName: "unused.png", publicUrl: "https://cdn.example.com/unused.png" },
    ] as never)
    vi.mocked(prisma.article.findMany).mockResolvedValue([article] as never)

    await expect(listMediaAssets({ status: "linked" })).resolves.toMatchObject({
      total: 1,
      items: [{ id: asset.id, linkedArticleCount: 1 }],
    })
    await expect(listMediaAssets({ status: "unlinked" })).resolves.toMatchObject({
      total: 1,
      items: [{ id: "asset-2", linkedArticleCount: 0 }],
    })
  })

  it("removes references and cover before deleting the object", async () => {
    vi.mocked(prisma.mediaAsset.findUnique).mockResolvedValue(asset as never)
    vi.mocked(prisma.article.findMany).mockResolvedValue([article] as never)
    vi.mocked(prisma.mediaAsset.delete).mockResolvedValue(asset as never)

    const result = await deleteMediaAsset("asset-1", "admin-1")

    expect(tx.mediaAsset.update).toHaveBeenCalledWith({
      where: { id: asset.id },
      data: { status: "DELETING" },
    })
    expect(tx.article.update).toHaveBeenCalledWith({
      where: { id: article.id },
      data: expect.objectContaining({
        content: "Intro\n",
        cover: null,
        lastEditedByUserId: "admin-1",
      }),
    })
    expect(tx.articleRevision.create).toHaveBeenCalled()
    expect(storageProvider.delete).toHaveBeenCalledWith(asset.objectKey)
    expect(prisma.mediaAsset.delete).toHaveBeenCalledWith({
      where: { id: asset.id },
    })
    expect(result).toMatchObject({
      status: "DELETED",
      affectedArticleCount: 1,
    })
  })

  it("keeps a failed deletion retryable", async () => {
    vi.mocked(prisma.mediaAsset.findUnique).mockResolvedValue(asset as never)
    vi.mocked(prisma.article.findMany).mockResolvedValue([] as never)
    storageProvider.delete.mockRejectedValue(new Error("storage down"))
    vi.mocked(prisma.mediaAsset.update).mockResolvedValue({
      ...asset,
      status: "DELETE_FAILED",
    } as never)

    await expect(deleteMediaAsset("asset-1", "admin-1")).resolves.toMatchObject({
      status: "DELETE_FAILED",
    })
    expect(prisma.mediaAsset.update).toHaveBeenCalledWith({
      where: { id: asset.id },
      data: { status: "DELETE_FAILED" },
    })

    storageProvider.delete.mockResolvedValue(undefined)
    vi.mocked(prisma.mediaAsset.findUnique).mockResolvedValue({
      ...asset,
      status: "DELETE_FAILED",
    } as never)
    vi.mocked(prisma.mediaAsset.delete).mockResolvedValue(asset as never)

    await expect(retryMediaAssetDeletion("asset-1")).resolves.toMatchObject({
      status: "DELETED",
    })
    expect(prisma.mediaAsset.delete).toHaveBeenCalledWith({
      where: { id: asset.id },
    })
  })

  it("does not mutate the database when an affected article cannot be rewritten", async () => {
    vi.mocked(prisma.mediaAsset.findUnique).mockResolvedValue(asset as never)
    vi.mocked(prisma.article.findMany).mockResolvedValue([
      { ...article, content: "<Broken" },
    ] as never)

    await expect(deleteMediaAsset("asset-1", "admin-1")).rejects.toThrow(
      "MEDIA_REFERENCE_REWRITE_FAILED"
    )
    expect(prisma.$transaction).not.toHaveBeenCalled()
    expect(storageProvider.delete).not.toHaveBeenCalled()
  })
})
