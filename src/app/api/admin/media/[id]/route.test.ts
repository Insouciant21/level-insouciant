import { beforeEach, describe, expect, it, vi } from "vitest"
import { revalidatePath } from "next/cache"

import { getCurrentAdmin } from "@/lib/auth"
import {
  deleteMediaAsset,
  renameMediaAsset,
  retryMediaAssetDeletion,
} from "@/lib/media/assets"
import { DELETE, PATCH } from "@/app/api/admin/media/[id]/route"

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}))

vi.mock("@/lib/auth", () => ({
  getCurrentAdmin: vi.fn(),
}))

vi.mock("@/lib/media/assets", () => ({
  deleteMediaAsset: vi.fn(),
  renameMediaAsset: vi.fn(),
  retryMediaAssetDeletion: vi.fn(),
}))

const admin = { id: "admin-1", role: "ADMIN" }
const params = { params: Promise.resolve({ id: "asset-1" }) }

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(getCurrentAdmin).mockResolvedValue(admin as never)
})

describe("PATCH /api/admin/media/:id", () => {
  it("requires an administrator", async () => {
    vi.mocked(getCurrentAdmin).mockResolvedValue(null)

    const response = await PATCH(
      new Request("http://localhost/api/admin/media/asset-1", {
        method: "PATCH",
        body: JSON.stringify({ displayName: "Renamed" }),
      }),
      params
    )

    expect(response.status).toBe(401)
    expect(renameMediaAsset).not.toHaveBeenCalled()
  })

  it("renames a media asset", async () => {
    vi.mocked(renameMediaAsset).mockResolvedValue({
      id: "asset-1",
      displayName: "Renamed",
    } as never)

    const response = await PATCH(
      new Request("http://localhost/api/admin/media/asset-1", {
        method: "PATCH",
        body: JSON.stringify({ displayName: "Renamed" }),
      }),
      params
    )

    expect(response.status).toBe(200)
    expect(renameMediaAsset).toHaveBeenCalledWith("asset-1", "Renamed")
    expect(await response.json()).toEqual({
      id: "asset-1",
      displayName: "Renamed",
    })
  })

  it("rejects an invalid rename body", async () => {
    const response = await PATCH(
      new Request("http://localhost/api/admin/media/asset-1", {
        method: "PATCH",
        body: "not json",
      }),
      params
    )

    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({ error: "INVALID_MEDIA_DISPLAY_NAME" })
  })
})

describe("DELETE /api/admin/media/:id", () => {
  it("deletes an asset and reports affected articles", async () => {
    vi.mocked(deleteMediaAsset).mockResolvedValue({
      assetId: "asset-1",
      status: "DELETED",
      affectedArticleCount: 2,
    })

    const response = await DELETE(
      new Request("http://localhost/api/admin/media/asset-1", {
        method: "DELETE",
      }),
      params
    )

    expect(response.status).toBe(200)
    expect(deleteMediaAsset).toHaveBeenCalledWith("asset-1", admin.id)
    expect(await response.json()).toMatchObject({
      status: "DELETED",
      affectedArticleCount: 2,
    })
    expect(revalidatePath).toHaveBeenCalledWith("/articles/[slug]", "page")
  })

  it("uses the retry service for failed object deletion", async () => {
    vi.mocked(retryMediaAssetDeletion).mockResolvedValue({
      assetId: "asset-1",
      status: "DELETED",
      affectedArticleCount: 0,
    })

    const response = await DELETE(
      new Request("http://localhost/api/admin/media/asset-1?retry=1", {
        method: "DELETE",
      }),
      params
    )

    expect(response.status).toBe(200)
    expect(retryMediaAssetDeletion).toHaveBeenCalledWith("asset-1")
    expect(deleteMediaAsset).not.toHaveBeenCalled()
  })

  it("maps a reference rewrite failure to conflict", async () => {
    vi.mocked(deleteMediaAsset).mockRejectedValue(
      new Error("MEDIA_REFERENCE_REWRITE_FAILED")
    )

    const response = await DELETE(
      new Request("http://localhost/api/admin/media/asset-1", {
        method: "DELETE",
      }),
      params
    )

    expect(response.status).toBe(409)
    expect(await response.json()).toEqual({
      error: "MEDIA_REFERENCE_REWRITE_FAILED",
    })
  })
})
