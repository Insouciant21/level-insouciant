import { describe, expect, it, vi } from "vitest"
import { runArticleTool, validateAgentMarkdown } from "./article-tools"
import { prisma } from "@/lib/prisma"

vi.mock("@/lib/prisma", () => ({
  prisma: {
    article: { findUnique: vi.fn(), findMany: vi.fn() },
  },
}))

const version = "3d8a223d-174f-4362-8344-307234b8ad51"
const draftAgent = {
  id: "token",
  name: "editor",
  ownerId: "admin",
  access: "DRAFT" as const,
}

describe("personal agent access", () => {
  it("rejects publishing and online edits with a draft credential", async () => {
    await expect(
      runArticleTool(draftAgent, "publish_article", {
        slug: "example",
        version,
      })
    ).rejects.toThrow("PUBLISH_ACCESS_REQUIRED")
    vi.mocked(prisma.article.findUnique).mockResolvedValueOnce({
      draft: false,
      version,
    } as never)
    await expect(
      runArticleTool(draftAgent, "edit_article", {
        slug: "example",
        version,
        title: "new",
      })
    ).rejects.toThrow("PUBLISH_ACCESS_REQUIRED")
  })

  it("keeps drafts out of read-only access", async () => {
    const readAgent = { ...draftAgent, access: "READ" as const }
    vi.mocked(prisma.article.findMany).mockResolvedValue([] as never)
    await expect(
      runArticleTool(readAgent, "list_articles", {})
    ).resolves.toEqual({ articles: [], nextOffset: null })
    await expect(
      runArticleTool(readAgent, "list_articles", { draft: true })
    ).rejects.toThrow("DRAFT_ACCESS_REQUIRED")
  })

  it("counts only published articles when a read-only token lists tags", async () => {
    const readAgent = { ...draftAgent, access: "READ" as const }
    vi.mocked(prisma.article.findMany).mockResolvedValueOnce([])
    await expect(runArticleTool(readAgent, "list_tags", {})).resolves.toEqual(
      []
    )
    expect(prisma.article.findMany).toHaveBeenLastCalledWith(
      expect.objectContaining({ where: { draft: false } })
    )
  })

  it("rejects a stale edit and rejects draft status in an edit payload", async () => {
    vi.mocked(prisma.article.findUnique).mockResolvedValueOnce({
      draft: true,
      version: "newer",
    } as never)
    await expect(
      runArticleTool(draftAgent, "edit_article", {
        slug: "example",
        version,
        title: "new",
      })
    ).rejects.toThrow("VERSION_CONFLICT")
    await expect(
      runArticleTool(draftAgent, "edit_article", {
        slug: "example",
        version,
        draft: false,
      })
    ).rejects.toThrow("INVALID_ARGUMENTS")
  })

  it("accepts Markdown with code and math, and rejects executable MDX", async () => {
    await expect(
      validateAgentMarkdown("## Example\n\n`{value}` and $x^{2}$")
    ).resolves.toBeUndefined()
    for (const source of [
      "Hello {value}",
      "<Widget />",
      "export const value = 1",
    ]) {
      await expect(validateAgentMarkdown(source)).rejects.toThrow(
        "MARKDOWN_REQUIRED"
      )
    }
  })
})
