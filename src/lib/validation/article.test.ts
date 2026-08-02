import { describe, expect, it } from "vitest"

import { managedArticleInputSchema } from "@/lib/validation/article"

describe("managedArticleInputSchema", () => {
  it("normalizes an article payload without accepting an invalid date", () => {
    const result = managedArticleInputSchema.safeParse({
      title: "  Hello  ",
      desc: " Summary ",
      content: " # Body ",
      category: " Notes ",
      tags: [" systems ", "systems", ""],
      cover: " ",
      publishedAt: "2026-08-02",
      draft: true,
      slug: " hello ",
    })

    expect(result.success).toBe(true)

    if (result.success) {
      expect(result.data).toMatchObject({
        title: "Hello",
        desc: "Summary",
        content: "# Body",
        category: "Notes",
        tags: ["systems"],
        cover: "",
        publishedAt: "2026-08-02",
        slug: "hello",
      })
    }

    expect(
      managedArticleInputSchema.safeParse({
        title: "Hello",
        desc: "Summary",
        content: "# Body",
        category: "Notes",
        tags: ["systems"],
        cover: "",
        publishedAt: "not-a-date",
        draft: true,
        slug: "hello",
      }).success
    ).toBe(false)
  })

  it("rejects an article with no usable tags", () => {
    const result = managedArticleInputSchema.safeParse({
      title: "Hello",
      desc: "Summary",
      content: "# Body",
      category: "Notes",
      tags: [" ", ""],
      cover: "",
      publishedAt: "2026-08-02",
      draft: false,
      slug: "hello",
    })

    expect(result.success).toBe(false)
  })
})
