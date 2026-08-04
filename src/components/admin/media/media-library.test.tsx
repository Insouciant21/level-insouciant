// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import type {
  MediaAssetDetails,
  MediaAssetSummary,
  MediaListResult,
} from "@/lib/media/assets"
import {
  fetchMediaAssetDetails,
  fetchMediaAssets,
  uploadMediaFile,
} from "@/components/admin/media/media-api"
import { MediaLibrary } from "@/components/admin/media/media-library"

vi.mock("@/components/admin/media/media-api", () => ({
  deleteMediaAsset: vi.fn(),
  fetchMediaAssetDetails: vi.fn(),
  fetchMediaAssets: vi.fn(),
  renameMediaAsset: vi.fn(),
  retryMediaAssetDeletion: vi.fn(),
  uploadMediaFile: vi.fn(),
}))

const asset: MediaAssetSummary = {
  id: "asset-1",
  displayName: "screen.png",
  provider: "r2",
  objectKey: "images/2026/08/screen.png",
  publicUrl: "https://cdn.example.com/screen.png",
  originalFilename: "screen.png",
  mimeType: "image/png",
  sizeBytes: 10,
  status: "ACTIVE",
  createdAt: "2026-08-04T00:00:00.000Z",
  updatedAt: "2026-08-04T00:00:00.000Z",
  linkedArticleCount: 1,
}

const initialData: MediaListResult = {
  items: [asset],
  page: 1,
  pageSize: 24,
  total: 1,
  totalPages: 1,
}

const details: MediaAssetDetails = {
  ...asset,
  articles: [
    {
      id: "article-1",
      slug: "first-article",
      title: "First article",
      draft: false,
      contentReferenceCount: 1,
      coverReference: false,
    },
  ],
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(fetchMediaAssets).mockResolvedValue(initialData)
  vi.mocked(fetchMediaAssetDetails).mockResolvedValue(details)
  vi.mocked(uploadMediaFile).mockResolvedValue(asset)
})

afterEach(cleanup)

describe("MediaLibrary", () => {
  it("renders assets, filters them, and shows linked article details", async () => {
    render(<MediaLibrary initialData={initialData} />)

    expect(screen.getByRole("heading", { name: "媒体库" })).toBeTruthy()
    expect(screen.getByText("screen.png")).toBeTruthy()
    expect(screen.getByText("已关联 1 篇文章")).toBeTruthy()

    fireEvent.change(screen.getByRole("searchbox", { name: "搜索媒体" }), {
      target: { value: "screen" },
    })

    await waitFor(() => {
      expect(fetchMediaAssets).toHaveBeenCalledWith({
        query: "screen",
        status: "all",
        page: 1,
        pageSize: 24,
      })
    })

    fireEvent.click(screen.getByRole("button", { name: "查看媒体详情 screen.png" }))

    await waitFor(() => {
      expect(fetchMediaAssetDetails).toHaveBeenCalledWith("asset-1")
    })
    expect(await screen.findByText("First article")).toBeTruthy()
  })

  it("accepts a selected image through the upload area", async () => {
    render(<MediaLibrary initialData={initialData} />)

    const file = new File([Buffer.from("image")], "new.png", {
      type: "image/png",
    })
    const input = screen.getByLabelText("选择图片")

    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() => {
      expect(uploadMediaFile).toHaveBeenCalledWith(file)
    })
  })
})
