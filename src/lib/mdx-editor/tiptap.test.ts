// @vitest-environment jsdom

import { canUseVisualEditor } from "@/lib/mdx-editor/visual-support"
import { Editor } from "@tiptap/core"
import { describe, expect, it } from "vitest"

import {
  createArticleEditorExtensions,
} from "@/lib/mdx-editor/tiptap"

describe("article Tiptap configuration", () => {
  it("accepts ordinary Markdown and math for the visual editor", () => {
    expect(
      canUseVisualEditor("# Title\n\nA paragraph with $x^2$ and ![alt](https://cdn.example/a.png).")
    ).toBe(true)
  })

  it("falls back to source mode for unsupported MDX constructs", () => {
    expect(canUseVisualEditor('import Chart from "./Chart"')).toBe(false)
    expect(canUseVisualEditor("<Chart data={points} />")).toBe(false)
    expect(canUseVisualEditor("A value: {runtimeValue}")).toBe(false)
  })

  it("registers Markdown, image, file handling, link, and math extensions", () => {
    const names = createArticleEditorExtensions({
      onFiles: () => undefined,
    }).map((extension) => extension.name)

    expect(names).toEqual(
      expect.arrayContaining([
        "starterKit",
        "link",
        "image",
        "fileHandler",
        "Mathematics",
        "markdown",
      ])
    )
  })
})


describe("Markdown table round trips", () => {
  it("inserts tables and adds/removes rows and columns", () => {
    const editor = new Editor({
      extensions: createArticleEditorExtensions({ onFiles: () => undefined }),
      content: "",
      contentType: "markdown",
    })
    const dimensions = () => {
      const table = editor.state.doc.firstChild
      return [table?.childCount, table?.firstChild?.childCount]
    }
    try {
      editor.commands.insertTable({ rows: 3, cols: 3, withHeaderRow: true })
      expect(dimensions()).toEqual([3, 3])
      editor.commands.addRowAfter()
      editor.commands.addColumnAfter()
      expect(dimensions()).toEqual([4, 4])
      editor.commands.deleteRow()
      editor.commands.deleteColumn()
      expect(dimensions()).toEqual([3, 3])
      expect(editor.getMarkdown()).toContain("|")
      editor.commands.deleteTable()
      expect(editor.getHTML()).not.toContain("<table")
    } finally {
      editor.destroy()
    }
  })

  it("preserves table cells and formatting after editing and reloading", () => {
    const source = "## Weather\n\n| Difficulty | Duration |\n| --- | --- |\n| Normal | **10 seconds** |\n| Nightmare | 12.5 seconds |\n\nAfter the table."
    const makeEditor = (content: string) => new Editor({
      extensions: createArticleEditorExtensions({ onFiles: () => undefined }),
      content,
      contentType: "markdown",
    })
    const editor = makeEditor(source)
    try {
      expect(editor.getHTML()).toContain("<table")
      editor.commands.insertContentAt(editor.state.doc.content.size - 1, " Updated.")
      const saved = editor.getMarkdown()
      expect(saved).toContain("**10 seconds**")
      expect(saved).toContain("Nightmare")
      const reloaded = makeEditor(saved)
      try {
        expect(reloaded.getHTML()).toContain("<table")
        expect(reloaded.getHTML()).toContain("12.5 seconds")
        expect(reloaded.getHTML()).toContain("Updated.")
      } finally {
        reloaded.destroy()
      }
    } finally {
      editor.destroy()
    }
  })
})

describe("LaTeX visual editing", () => {
  const source = String.raw`Inline $\frac{a}{b} + x^{2}$.

$$
\begin{aligned}
x &= \frac{1}{2} \\
y &= \sqrt{x}
\end{aligned}
$$`

  it("allows braces inside math while retaining the MDX safety fallback", () => {
    expect(canUseVisualEditor(source)).toBe(true)
    expect(canUseVisualEditor(source + "\n\n{runtimeValue}")).toBe(false)
    expect(canUseVisualEditor(source + "\n\n<Chart />")).toBe(false)
    expect(canUseVisualEditor(String.raw`Escaped \$ {runtimeValue} \$`)).toBe(false)
    expect(canUseVisualEditor("Unclosed $x^{2}")).toBe(false)
  })

  it("preserves inline and block LaTeX after editing and reloading", () => {
    const makeEditor = (content: string) => new Editor({
      extensions: createArticleEditorExtensions({ onFiles: () => undefined }),
      content,
      contentType: "markdown",
    })
    const editor = makeEditor(source)
    try {
      const formulas = (instance: Editor) => {
        const result: string[] = []
        instance.state.doc.descendants(node => {
          if (node.type.name === "inlineMath" || node.type.name === "blockMath") {
            result.push(node.attrs.latex)
          }
        })
        return result
      }
      expect(formulas(editor)).toHaveLength(2)
      editor.commands.insertContentAt(1, "Updated ")
      const reloaded = makeEditor(editor.getMarkdown())
      try {
        expect(formulas(reloaded)).toEqual(formulas(editor))
      } finally { reloaded.destroy() }
    } finally { editor.destroy() }
  })
})
