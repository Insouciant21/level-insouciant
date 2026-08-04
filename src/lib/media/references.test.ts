import { describe, expect, it } from "vitest"

import {
  countImageReference,
  extractImageReferences,
  hasMissingImageAlt,
  removeImageReferences,
} from "@/lib/media/references"

const firstImageUrl = "https://cdn.example.com/images/first.png"
const secondImageUrl = "https://cdn.example.com/images/second.png"

describe("MDX image references", () => {
  it("extracts image nodes while ignoring links and code blocks", () => {
    const source = [
      "Intro",
      "",
      `![First](${firstImageUrl} \"title\")`,
      "",
      `Inline ![First again](${firstImageUrl}) text`,
      "",
      `[ordinary link](${firstImageUrl})`,
      "",
      "```md",
      `![Code](${firstImageUrl})`,
      "```",
      "",
      `![Second](${secondImageUrl})`,
    ].join("\n")

    expect(extractImageReferences(source)).toEqual([
      { url: firstImageUrl, count: 2 },
      { url: secondImageUrl, count: 1 },
    ])
  })

  it("counts a URL without treating a trailing slash as meaningful", () => {
    expect(
      countImageReference(
        `![First](${firstImageUrl}/)`,
        `${firstImageUrl}/`
      )
    ).toBe(1)
  })

  it("detects image nodes that still need alt text", () => {
    expect(hasMissingImageAlt(`![](${firstImageUrl})`)).toBe(true)
    expect(hasMissingImageAlt(`![A useful description](${firstImageUrl})`)).toBe(
      false
    )
    expect(hasMissingImageAlt("```md\n![](" + firstImageUrl + ")\n```")).toBe(
      false
    )
  })

  it("removes standalone and inline image references without stringifying MDX", () => {
    const source = [
      "before",
      "",
      `![First](${firstImageUrl})`,
      "",
      `Keep this paragraph ![inline](${firstImageUrl}) and its text.`,
      "",
      `![Second](${secondImageUrl})`,
      "",
      "```md",
      `![Code](${firstImageUrl})`,
      "```",
      "",
      "after",
    ].join("\n")

    const result = removeImageReferences(source, firstImageUrl)

    expect(result.removed).toBe(2)
    expect(result.source).toContain("before")
    expect(result.source).toContain("Keep this paragraph  and its text.")
    expect(result.source).toContain(`![Second](${secondImageUrl})`)
    expect(result.source).toContain(`![Code](${firstImageUrl})`)
    expect(result.source).toContain("after")
    expect(result.source).not.toContain(`![First](${firstImageUrl})`)
  })

  it("reports parse failures separately for scanning and rewriting", () => {
    const invalidMdx = "<Broken"

    expect(() => extractImageReferences(invalidMdx)).toThrow(
      "MEDIA_REFERENCE_PARSE_FAILED"
    )
    expect(() => removeImageReferences(invalidMdx, firstImageUrl)).toThrow(
      "MEDIA_REFERENCE_REWRITE_FAILED"
    )
  })
})
