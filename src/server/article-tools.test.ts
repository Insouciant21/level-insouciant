import { describe, expect, it, vi } from "vitest"
import { runArticleTool } from "./article-tools"
import { prisma } from "@/lib/prisma"

const { createManagedArticleMock, updateManagedArticleMock } = vi.hoisted(
  () => ({
    createManagedArticleMock: vi.fn(),
    updateManagedArticleMock: vi.fn(),
  })
)

vi.mock("@/lib/content-admin", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/content-admin")>()
  return {
    ...actual,
    createManagedArticle: createManagedArticleMock,
    updateManagedArticle: updateManagedArticleMock,
  }
})

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

  it("accepts full MDX content when creating and editing articles", async () => {
    const mdxContent = [
      'import { Callout } from "./callout"',
      "",
      "## MDX Example",
      "",
      "<Callout>{runtimeValue}</Callout>",
      "",
      '<a href="/notes">Relative link</a>',
      "",
      "export const meta = { order: 1 }",
    ].join("\n")

    createManagedArticleMock.mockResolvedValueOnce({
      slug: "mdx-draft",
      title: "MDX Draft",
      draft: true,
      version,
    })

    await expect(
      runArticleTool(draftAgent, "create_draft", {
        slug: "mdx-draft",
        title: "MDX Draft",
        desc: "Draft with MDX",
        category: "Engineering",
        tags: ["mdx"],
        content: mdxContent,
      })
    ).resolves.toMatchObject({
      slug: "mdx-draft",
      draft: true,
      version,
    })

    expect(createManagedArticleMock).toHaveBeenCalledWith(
      expect.objectContaining({ content: mdxContent, draft: true }),
      "admin",
      "create_draft · editor (token)"
    )

    vi.mocked(prisma.article.findUnique).mockResolvedValueOnce({
      slug: "mdx-draft",
      title: "MDX Draft",
      desc: "Draft with MDX",
      category: "Engineering",
      tags: ["mdx"],
      cover: null,
      publishedAt: new Date("2026-11-25T00:00:00.000Z"),
      draft: true,
      version,
      content: "old",
    } as never)

    updateManagedArticleMock.mockResolvedValueOnce({
      slug: "mdx-draft",
      title: "MDX Draft",
      draft: true,
      version: "f263e2ae-18a0-4e5c-b5a5-f309d0866c38",
    })

    await expect(
      runArticleTool(draftAgent, "edit_article", {
        slug: "mdx-draft",
        version,
        content: mdxContent,
      })
    ).resolves.toMatchObject({
      slug: "mdx-draft",
      version: "f263e2ae-18a0-4e5c-b5a5-f309d0866c38",
    })

    expect(updateManagedArticleMock).toHaveBeenCalledWith(
      "mdx-draft",
      expect.objectContaining({ content: mdxContent }),
      "admin",
      { version, draft: true, reason: "edit_article · editor (token)" }
    )
  })
})
