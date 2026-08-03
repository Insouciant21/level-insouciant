// @vitest-environment jsdom

import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { FaviconUploadForm } from "@/components/admin/favicon-upload-form"

vi.mock("@/app/admin/favicon-actions", () => ({
  uploadFaviconAction: vi.fn(),
}))

describe("FaviconUploadForm", () => {
  it("renders a multipart PNG and ICO upload control", () => {
    render(<FaviconUploadForm currentIconUrl="/site-icons/icon-32.png?v=test" />)

    const form = screen.getByRole("button", { name: "上传并生成图标" }).closest("form")
    const input = screen.getByLabelText("站点图标") as HTMLInputElement
    const preview = screen.getByAltText("当前站点图标")

    expect(form).not.toBeNull()
    expect(input.type).toBe("file")
    expect(input.accept).toContain(".png")
    expect(input.accept).toContain(".ico")
    expect(preview.getAttribute("width")).toBe("32")
    expect(preview.getAttribute("height")).toBe("32")
  })
})
