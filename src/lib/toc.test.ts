import { describe, expect, it } from "vitest"

import { extractTableOfContents } from "@/lib/toc"

describe("extractTableOfContents", () => {
  it("reads real headings without treating fenced code as article structure", () => {
    const source = [
      "# Article title",
      "",
      "## **Systems** and [links](https://example.com)",
      "",
      "```md",
      "## Heading inside a code sample",
      "```",
      "",
      "### 中文标题",
      "",
      '<Callout title="### JSX is not a heading" />',
      "",
      "## **Systems** and [links](https://example.com)",
    ].join("\n")

    expect(extractTableOfContents(source)).toEqual([
      { id: "systems-and-links", text: "Systems and links", depth: 2 },
      { id: "中文标题", text: "中文标题", depth: 3 },
      { id: "systems-and-links-2", text: "Systems and links", depth: 2 },
    ])
  })
})
