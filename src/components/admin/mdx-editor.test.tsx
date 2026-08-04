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
import { MdxEditor } from "@/components/admin/mdx-editor"

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

vi.mock("@mdx-js/mdx", () => ({
  evaluate: vi.fn().mockResolvedValue({
    default: () => null,
  }),
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

function mockMatchMedia(matches: boolean) {
  vi.stubGlobal(
    "matchMedia",
    (query: string) =>
      ({
        matches,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }) as MediaQueryList
  )
}

function defineScrollMetrics(
  element: HTMLElement,
  metrics: { scrollHeight: number; clientHeight: number }
) {
  Object.defineProperties(element, {
    scrollTop: {
      configurable: true,
      value: 0,
      writable: true,
    },
    scrollHeight: {
      configurable: true,
      value: metrics.scrollHeight,
    },
    clientHeight: {
      configurable: true,
      value: metrics.clientHeight,
    },
  })
}

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
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

  it("exposes the CodeMirror scroll container", async () => {
    const scrollContainerRef = { current: null as HTMLElement | null }

    render(
      <MdxEditor
        value="# Draft"
        onChange={vi.fn()}
        scrollContainerRef={scrollContainerRef}
      />
    )

    await waitFor(() => {
      expect(scrollContainerRef.current).not.toBeNull()
    })
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

  it("separates metadata from the desktop source and preview workbench", async () => {
    mockMatchMedia(true)

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
        container.querySelector('[data-editor-panel="source"]')
      ).not.toBeNull()
      expect(
        container.querySelector('[data-editor-panel="preview"]')
      ).not.toBeNull()
    })

    expect(screen.getByRole("heading", { name: "MDX 源码" })).not.toBeNull()
    expect(screen.getByRole("heading", { name: "实时效果" })).not.toBeNull()

    const panelHeaders = Array.from(
      container.querySelectorAll("[data-editor-panel-header]")
    )

    expect(panelHeaders).toHaveLength(2)
    expect(panelHeaders[0]?.className).toBe(panelHeaders[1]?.className)
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

  it("uses themed scrollbars for the source and preview surfaces", async () => {
    mockMatchMedia(true)

    const { container } = render(
      <AdminArticleEditorForm
        mode="edit"
        action={vi.fn()}
        values={values}
        statusLabel="已发布"
      />
    )

    await waitFor(() => {
      expect(
        container.querySelector('[data-editor-panel="preview"]')
      ).not.toBeNull()
    })

    expect(
      screen
        .getByTestId("codemirror-scroll")
        .classList.contains("perfect-scrollbar")
    ).toBe(true)
    expect(
      screen
        .getByTestId("article-editor-preview-scroll")
        .classList.contains("perfect-scrollbar")
    ).toBe(true)
  })

  it("syncs desktop source scrolling to the preview proportionally", async () => {
    mockMatchMedia(true)

    const { container } = render(
      <AdminArticleEditorForm
        mode="edit"
        action={vi.fn()}
        values={values}
        statusLabel="已发布"
      />
    )

    await waitFor(() => {
      expect(
        container.querySelector('[data-editor-panel="preview"]')
      ).not.toBeNull()
    })

    const source = screen.getByTestId("codemirror-scroll")
    const target = screen.getByTestId("article-editor-preview-scroll")

    defineScrollMetrics(source, { scrollHeight: 650, clientHeight: 150 })
    defineScrollMetrics(target, { scrollHeight: 1150, clientHeight: 150 })

    source.scrollTop = 150
    fireEvent.scroll(source)

    expect(target.scrollTop).toBe(300)
  })

  it("switches between source and preview panels on mobile", async () => {
    mockMatchMedia(false)

    render(
      <AdminArticleEditorForm
        mode="create"
        action={vi.fn()}
        values={values}
        statusLabel="新文章 / 未发布"
      />
    )

    expect(screen.getByTestId("article-editor-source-panel")).not.toBeNull()
    expect(screen.queryByTestId("article-editor-preview-panel")).toBeNull()
    expect(
      screen.getByRole("button", { name: "源码" }).getAttribute("aria-pressed")
    ).toBe("true")

    fireEvent.click(screen.getByRole("button", { name: "效果" }))

    await waitFor(() => {
      expect(screen.queryByTestId("article-editor-source-panel")).toBeNull()
      expect(screen.getByTestId("article-editor-preview-panel")).not.toBeNull()
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
})
