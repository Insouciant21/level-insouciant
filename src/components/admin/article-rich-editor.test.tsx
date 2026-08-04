// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { ArticleRichEditor } from "@/components/admin/article-rich-editor"
import type { MediaAssetSummary } from "@/lib/media/assets"

vi.mock("@/components/admin/media/media-picker", () => ({
  MediaPicker: ({ onSelect }: { onSelect: (asset: MediaAssetSummary) => void }) => (
    <button
      type="button"
      onClick={() =>
        onSelect({
          id: "asset-1",
          displayName: "diagram.png",
          provider: "r2",
          objectKey: "images/diagram.png",
          publicUrl: "https://cdn.example.com/diagram.png",
          originalFilename: "diagram.png",
          mimeType: "image/png",
          sizeBytes: 10,
          status: "ACTIVE",
          createdAt: "2026-08-04T00:00:00.000Z",
          updatedAt: "2026-08-04T00:00:00.000Z",
          linkedArticleCount: 0,
        })
      }
    >
      测试媒体选择器
    </button>
  ),
}))

vi.mock("@/components/admin/media/media-api", () => ({
  uploadMediaFile: vi.fn(),
}))

afterEach(cleanup)

describe("ArticleRichEditor", () => {
  it("does not render the removed visual editor guidance copy", () => {
    render(<ArticleRichEditor value="# Draft" onChange={vi.fn()} />)

    expect(
      screen.queryByText(
        "可视化编辑支持 Markdown、链接、列表、公式和图片；复杂 MDX 请切换到源码模式。"
      )
    ).toBeNull()
  })

  it("requires alt text before inserting an existing media asset", async () => {
    const onChange = vi.fn()
    render(<ArticleRichEditor value="# Draft" onChange={onChange} />)

    fireEvent.click(screen.getByRole("button", { name: "测试媒体选择器" }))

    const altInput = await screen.findByLabelText(/Alt 文本/)
    fireEvent.change(altInput, { target: { value: "" } })
    fireEvent.click(screen.getByRole("button", { name: "插入图片" }))

    expect(screen.getByText(/请填写图片 alt 文本/)).toBeTruthy()

    fireEvent.change(altInput, { target: { value: "系统架构图" } })
    fireEvent.click(screen.getByRole("button", { name: "插入图片" }))

    await waitFor(() => {
      expect(onChange).toHaveBeenCalled()
    })
    expect(onChange.mock.calls.at(-1)?.[0]).toContain(
      "https://cdn.example.com/diagram.png"
    )
    expect(onChange.mock.calls.at(-1)?.[0]).toContain("系统架构图")
  })
})
