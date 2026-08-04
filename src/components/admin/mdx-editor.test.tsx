// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { AdminArticleEditorForm } from "@/components/admin/admin-article-editor-form"
import { MdxEditor } from "@/components/admin/mdx-editor"

vi.mock("@uiw/react-codemirror", () => ({
  EditorView: {
    theme: (styles: unknown, options: unknown) => ({ styles, options }),
  },
  default: ({
    value,
    onChange,
    id,
    theme,
    "aria-label": ariaLabel,
  }: {
    value: string
    onChange?: (value: string) => void
    id?: string
    theme?: "light" | "dark" | "none" | unknown
    "aria-label"?: string
    [key: string]: unknown
  }) => {
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
      <textarea
        id={id}
        aria-label={ariaLabel}
        data-theme={typeof theme === "string" ? theme : "custom"}
        data-theme-dark={String(themeIsDark)}
        data-gutter-font={String(guttersAreMonospace)}
        data-content-font={String(contentIsMonospace)}
        data-testid="codemirror-editor"
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
      />
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
})

describe("AdminArticleEditorForm", () => {
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
