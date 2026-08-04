import { beforeEach, describe, expect, it, vi } from "vitest"

import { getCurrentAdmin } from "@/lib/auth"
import {
  createMediaAsset,
  listMediaAssets,
} from "@/lib/media/assets"
import { GET, POST } from "@/app/api/admin/media/route"

vi.mock("@/lib/auth", () => ({
  getCurrentAdmin: vi.fn(),
}))

vi.mock("@/lib/media/assets", () => ({
  createMediaAsset: vi.fn(),
  listMediaAssets: vi.fn(),
}))

const admin = { id: "admin-1", role: "ADMIN" }
const result = {
  items: [],
  page: 1,
  pageSize: 24,
  total: 0,
  totalPages: 1,
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(getCurrentAdmin).mockResolvedValue(admin as never)
  vi.mocked(listMediaAssets).mockResolvedValue(result)
})

describe("GET /api/admin/media", () => {
  it("requires an administrator", async () => {
    vi.mocked(getCurrentAdmin).mockResolvedValue(null)

    const response = await GET(new Request("http://localhost/api/admin/media"))

    expect(response.status).toBe(401)
    expect(await response.json()).toEqual({ error: "AUTH_REQUIRED" })
    expect(listMediaAssets).not.toHaveBeenCalled()
  })

  it("passes search, filter, and pagination to the service", async () => {
    const response = await GET(
      new Request(
        "http://localhost/api/admin/media?query=screen&status=linked&page=2&pageSize=12"
      )
    )

    expect(response.status).toBe(200)
    expect(listMediaAssets).toHaveBeenCalledWith({
      query: "screen",
      status: "linked",
      page: 2,
      pageSize: 12,
    })
    expect(await response.json()).toEqual(result)
  })
})

describe("POST /api/admin/media", () => {
  it("rejects requests without a file", async () => {
    const response = await POST(
      new Request("http://localhost/api/admin/media", {
        method: "POST",
        body: new FormData(),
      })
    )

    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({ error: "INVALID_MEDIA_FILE" })
  })

  it("uploads a multipart file for the current administrator", async () => {
    const file = new File([Buffer.from("image")], "screen.png", {
      type: "image/png",
    })
    const formData = new FormData()
    formData.set("file", file)
    vi.mocked(createMediaAsset).mockResolvedValue({
      id: "asset-1",
    } as never)

    const response = await POST(
      new Request("http://localhost/api/admin/media", {
        method: "POST",
        body: formData,
      })
    )

    expect(response.status).toBe(201)
    expect(createMediaAsset).toHaveBeenCalledWith({
      file: expect.any(File),
      uploadedByUserId: admin.id,
    })
    expect(await response.json()).toEqual({ id: "asset-1" })
  })

  it("maps media validation failures to bad requests", async () => {
    const file = new File([Buffer.from("image")], "screen.svg", {
      type: "image/svg+xml",
    })
    const formData = new FormData()
    formData.set("file", file)
    vi.mocked(createMediaAsset).mockRejectedValue(new Error("INVALID_MEDIA_TYPE"))

    const response = await POST(
      new Request("http://localhost/api/admin/media", {
        method: "POST",
        body: formData,
      })
    )

    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({ error: "INVALID_MEDIA_TYPE" })
  })
})
