// @vitest-environment jsdom

import * as React from "react"
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { AdminArticleEditorForm } from "@/components/admin/admin-article-editor-form"
import { uploadMediaFile } from "@/components/admin/media/media-api"
import { MdxEditor } from "@/components/admin/mdx-editor"
import type { MediaAssetSummary } from "@/lib/media/assets"

const { lineWrapping } = vi.hoisted(() => ({
  lineWrapping: { type: "line-wrapping" },
}))

vi.mock("@uiw/react-codemirror", () => ({
  EditorView: {
    lineWrapping,
    theme: (styles: unknown, options: unknown) => ({ styles, options }),
  },
  default: function MockCodeMirror({
    value,
    onChange,
    id,
    theme,
    extensions,
    onCreateEditor,
    "aria-label": ariaLabel,
  }: {
    value: string
    onChange?: (value: string) => void
    id?: string
    theme?: "light" | "dark" | "none" | unknown
    extensions?: unknown[]
    onCreateEditor?: (view: { scrollDOM: HTMLElement }, state: unknown) => void
    "aria-label"?: string
    [key: string]: unknown
  }) {
    const scrollContainerRef = React.useRef<HTMLDivElement>(null)

    React.useEffect(() => {
      if (scrollContainerRef.current) {
        onCreateEditor?.({ scrollDOM: scrollContainerRef.current }, {})
      }
    }, [onCreateEditor])

    const themeIsDark =
      typeof theme === "object" &&
      theme !== null &&
      "options" in theme &&
      typeof theme.options === "object" &&
      theme.options !== null &&
      "dark" in theme.options &&
      theme.options.dark === true
    const themeStyles =
      typeof theme === "object" && theme !== null && "styles" in theme
        ? theme.styles
        : null
    const getThemeRule = (selector: string) =>
      typeof themeStyles === "object" &&
      themeStyles !== null &&
      selector in themeStyles
        ? (themeStyles as Record<string, unknown>)[selector]
        : null
    const gutterStyles = getThemeRule(".cm-gutters")
    const contentStyles = getThemeRule(".cm-content")
    const guttersAreMonospace =
      typeof gutterStyles === "object" &&
      gutterStyles !== null &&
      "fontFamily" in gutterStyles &&
      gutterStyles.fontFamily === "var(--font-mono)"
    const contentIsMonospace =
      typeof contentStyles === "object" &&
      contentStyles !== null &&
      "fontFamily" in contentStyles &&
      contentStyles.fontFamily === "var(--font-mono)"

    return (
      <div ref={scrollContainerRef} data-testid="codemirror-scroll">
        <textarea
          id={id}
          aria-label={ariaLabel}
          data-theme={typeof theme === "string" ? theme : "custom"}
          data-theme-dark={String(themeIsDark)}
          data-gutter-font={String(guttersAreMonospace)}
          data-content-font={String(contentIsMonospace)}
          data-line-wrapping={String(
            extensions?.includes(lineWrapping) ?? false
          )}
          data-testid="codemirror-editor"
          value={value}
          onChange={(event) => onChange?.(event.target.value)}
        />
      </div>
    )
  },
}))

vi.mock("@/components/admin/media/media-api", () => ({
  fetchMediaAssetDetails: vi.fn(),
  fetchMediaAssets: vi.fn(),
  uploadMediaFile: vi.fn(),
}))

const values = {
  slug: "test-article",
  title: "Test article",
  desc: "Test summary",
  category: "Notes",
  tags: "systems",
  cover: "",
  publishedAt: "2026-08-02",
  content: "# Draft content",
}

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe("MdxEditor", () => {
  it("keeps the CodeMirror surface controlled and forwards edits", () => {
    const onChange = vi.fn()

    render(<MdxEditor value="# Draft" onChange={onChange} />)

    const editor = screen.getByTestId("codemirror-editor")
    expect((editor as HTMLTextAreaElement).value).toBe("# Draft")

    fireEvent.change(editor, { target: { value: "## Updated" } })

    expect(onChange).toHaveBeenCalledWith("## Updated")
  })

  it("uses a custom dark theme for the CodeMirror chrome", () => {
    render(<MdxEditor value="# Draft" onChange={vi.fn()} />)

    const editor = screen.getAllByTestId("codemirror-editor").at(-1)

    expect(editor?.getAttribute("data-theme")).toBe("custom")
    expect(editor?.getAttribute("data-theme-dark")).toBe("true")
  })

  it("uses the editor font for line numbers", () => {
    render(<MdxEditor value="# Draft" onChange={vi.fn()} />)

    const editor = screen.getAllByTestId("codemirror-editor").at(-1)

    expect(editor?.getAttribute("data-gutter-font")).toBe("true")
    expect(editor?.getAttribute("data-content-font")).toBe("true")
  })

  it("wraps long source lines", () => {
    render(<MdxEditor value="# Draft" onChange={vi.fn()} />)

    const editor = screen.getAllByTestId("codemirror-editor").at(-1)

    expect(editor?.getAttribute("data-line-wrapping")).toBe("true")
  })

})

describe("AdminArticleEditorForm", () => {
  it("uses the styled date picker while preserving publishedAt form serialization", () => {
    const { container } = render(
      <AdminArticleEditorForm
        mode="edit"
        action={vi.fn()}
        values={values}
        statusLabel="已发布"
      />
    )

    expect(container.querySelector('input[type="date"]')).toBeNull()

    const publishedAt = container.querySelector(
      'input[type="hidden"][name="publishedAt"]'
    ) as HTMLInputElement | null

    expect(publishedAt).not.toBeNull()
    expect(publishedAt?.value).toBe(values.publishedAt)

    fireEvent.click(screen.getByRole("button", { name: "打开日期选择器" }))
    fireEvent.click(
      screen.getByRole("button", { name: "选择 2026年8月12日" })
    )

    expect(publishedAt?.value).toBe("2026-08-12")
  })

  it("keeps metadata separate from the desktop visual editor workbench", async () => {
    const { container } = render(
      <AdminArticleEditorForm
        mode="edit"
        action={vi.fn()}
        values={values}
        statusLabel="已发布"
      />
    )

    expect(
      container.querySelector('[data-editor-section="metadata"]')
    ).not.toBeNull()
    expect(container.querySelector("[data-editor-workbench]")).not.toBeNull()

    await waitFor(() => {
      expect(
        container.querySelector('[data-editor-panel="visual"]')
      ).not.toBeNull()
    })

    expect(screen.getByRole("heading", { name: "可视化编辑器" })).not.toBeNull()
    expect(screen.queryByRole("heading", { name: "实时效果" })).toBeNull()
    expect(screen.queryByRole("button", { name: "效果" })).toBeNull()

    const panelHeaders = Array.from(
      container.querySelectorAll("[data-editor-panel-header]")
    )

    expect(panelHeaders).toHaveLength(1)
  })

  it("keeps the editor header compact and avoids a duplicate metadata divider", () => {
    const { container } = render(
      <AdminArticleEditorForm
        mode="edit"
        action={vi.fn()}
        values={values}
        statusLabel="已发布"
      />
    )

    expect(
      screen.queryByText(
        "使用结构化字段加原始 MDX 正文编辑，保存即生成修订记录。"
      )
    ).toBeNull()
    expect(
      screen.queryByText("每次保存都会生成修订记录，便于后续回滚。")
    ).toBeNull()

    const metadata = container.querySelector('[data-editor-section="metadata"]')

    expect(metadata?.className).not.toContain("border-y")
    expect(metadata?.className).toContain("border-b")
  })

  it("keeps metadata close to the editor header", () => {
    const { container } = render(
      <AdminArticleEditorForm
        mode="edit"
        action={vi.fn()}
        values={values}
        statusLabel="已发布"
      />
    )

    expect(container.querySelector("form")?.className).not.toContain("mt-6")
  })

  it("uses a themed scrollbar for the source editor", () => {
    render(
      <AdminArticleEditorForm
        mode="edit"
        action={vi.fn()}
        values={values}
        statusLabel="已发布"
      />
    )

    fireEvent.click(screen.getByRole("button", { name: "源码" }))

    expect(
      screen
        .getByTestId("codemirror-scroll")
        .classList.contains("perfect-scrollbar")
    ).toBe(true)
    expect(screen.queryByTestId("article-editor-preview-scroll")).toBeNull()
  })

  it("switches between visual and source panels on mobile", async () => {
    render(
      <AdminArticleEditorForm
        mode="create"
        action={vi.fn()}
        values={values}
        statusLabel="新文章 / 未发布"
      />
    )

    expect(screen.getByTestId("article-editor-visual-panel")).not.toBeNull()
    expect(screen.queryByTestId("article-editor-preview-panel")).toBeNull()
    expect(screen.queryByRole("button", { name: "效果" })).toBeNull()
    expect(
      screen.getByRole("button", { name: "可视化" }).getAttribute("aria-pressed")
    ).toBe("true")

    fireEvent.click(screen.getByRole("button", { name: "源码" }))

    await waitFor(() => {
      expect(screen.getByTestId("article-editor-source-panel")).not.toBeNull()
    })

    await waitFor(() => {
      expect(screen.queryByTestId("article-editor-visual-panel")).toBeNull()
      expect(screen.getByTestId("article-editor-source-panel")).not.toBeNull()
    })
    expect(
      document.querySelector('input[type="hidden"][name="content"]')
    ).not.toBeNull()
    expect(
      (
        document.querySelector(
          'input[type="hidden"][name="content"]'
        ) as HTMLInputElement
      ).value
    ).toBe(values.content)
  })

  it("submits the current MDX through a hidden content field", () => {
    render(
      <AdminArticleEditorForm
        mode="create"
        action={vi.fn()}
        values={values}
        statusLabel="Draft"
      />
    )

    const contentField = document.querySelector(
      'input[type="hidden"][name="content"]'
    )

    expect(contentField).not.toBeNull()
    expect((contentField as HTMLInputElement).value).toBe(values.content)
  })

  it("serializes an uploaded cover URL through the hidden cover field", async () => {
    const asset: MediaAssetSummary = {
      id: "cover-asset",
      displayName: "cover.png",
      provider: "r2",
      objectKey: "images/2026/08/cover.png",
      publicUrl: "https://cdn.example.com/cover.png",
      originalFilename: "cover.png",
      mimeType: "image/png",
      sizeBytes: 10,
      status: "ACTIVE",
      createdAt: "2026-08-04T00:00:00.000Z",
      updatedAt: "2026-08-04T00:00:00.000Z",
      linkedArticleCount: 0,
    }
    vi.mocked(uploadMediaFile).mockResolvedValue(asset)

    render(
      <AdminArticleEditorForm
        mode="create"
        action={vi.fn()}
        values={{ ...values, cover: "" }}
        statusLabel="Draft"
      />
    )

    const file = new File([Buffer.from("cover")], "cover.png", {
      type: "image/png",
    })
    fireEvent.change(screen.getByLabelText("上传封面"), {
      target: { files: [file] },
    })

    await waitFor(() => {
      expect(uploadMediaFile).toHaveBeenCalledWith(file)
    })
    await waitFor(() => {
      expect(
        (document.querySelector('input[name="cover"]') as HTMLInputElement)
          .value
      ).toBe(asset.publicUrl)
    })
    expect(screen.getByAltText("当前文章封面")).toBeTruthy()
  })

  it("blocks saving when the source contains an image without alt text", () => {
    const action = vi.fn()

    render(
      <AdminArticleEditorForm
        mode="create"
        action={action}
        values={{ ...values, content: `![](${"https://cdn.example.com/image.png"})` }}
        statusLabel="Draft"
      />
    )

    fireEvent.submit(
      screen.getByRole("button", { name: "保存草稿" }).closest("form") as HTMLFormElement
    )

    expect(action).not.toHaveBeenCalled()
    expect(screen.getByRole("alert").textContent).toContain(
      "请为正文中的每张图片填写 alt 文本后再保存。"
    )
  })
})
