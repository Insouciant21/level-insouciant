import { describe, expect, it } from "vitest"

import {
  canUseVisualEditor,
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
