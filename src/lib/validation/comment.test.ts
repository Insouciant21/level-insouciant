import { describe, expect, it } from "vitest"

import { commentInputSchema } from "@/lib/validation/comment"

describe("commentInputSchema", () => {
  it("trims comment content and empty parent ids", () => {
    expect(
      commentInputSchema.parse({
        content: "  A useful comment  ",
        parentId: " ",
      })
    ).toEqual({
      content: "A useful comment",
      parentId: null,
    })
  })

  it("rejects blank comments and caps content at the domain limit", () => {
    expect(commentInputSchema.safeParse({ content: "   " }).success).toBe(false)

    const result = commentInputSchema.parse({ content: "x".repeat(2_100) })
    expect(result.content).toHaveLength(2_000)
  })
})
