import { describe, expect, it } from "vitest"

import { normalizeMdxSource } from "@/lib/mdx"

describe("normalizeMdxSource", () => {
  it("normalizes actual code nodes without rewriting fence-like MDX expressions", () => {
    const fence = "```"
    const fakeFence = `${fence}ts filename=fake.ts\nconst fake = true\n${fence}`
    const source = [
      `{String(${JSON.stringify(fakeFence)})}`,
      "",
      `${fence}ts filename=example.ts`,
      "  const value = true",
      "",
      fence,
    ].join("\n")

    const normalized = normalizeMdxSource(source)

    expect(normalized).toContain(`{String(${JSON.stringify(fakeFence)})}`)
    expect(normalized).not.toContain('title="fake.ts"')
    expect(normalized).toContain(
      `${fence}ts title="example.ts"\nconst value = true\n${fence}`
    )
  })
})
