import { describe, expect, it, vi } from "vitest"
import { handleAgentRequest, validateAgentMarkdown } from "./agent-articles"
import { prisma } from "@/lib/prisma"

vi.mock("@/lib/prisma", () => ({
  prisma: {
    agentToken: { findFirst: vi.fn() },
    article: { findUnique: vi.fn(), findMany: vi.fn() },
  },
}))

const version = "3d8a223d-174f-4362-8344-307234b8ad51"
const bearer = `Bearer li_${"a".repeat(43)}`
const principal = {
  id: "token",
  name: "editor",
  ownerId: "admin",
  access: "DRAFT",
}

function call(tool: string, args: object, authorization = bearer) {
  return handleAgentRequest(
    new Request("https://blog.test/api/agent/articles", {
      method: "POST",
      headers: { authorization, "content-type": "application/json" },
      body: JSON.stringify({ tool, arguments: args }),
    })
  )
}

describe("personal agent access", () => {
  it("requires a bearer token even when a browser could have a session", async () => {
    expect((await call("list_articles", {}, "")).status).toBe(401)
  })

  it("looks up only active credentials belonging to current administrators", async () => {
    vi.mocked(prisma.agentToken.findFirst).mockResolvedValueOnce(null)
    expect((await call("list_articles", {})).status).toBe(401)
    expect(prisma.agentToken.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          revokedAt: null,
          expiresAt: { gt: expect.any(Date) },
          owner: { role: "ADMIN" },
        }),
      })
    )
  })

  it("rejects publishing and online edits with a draft credential", async () => {
    vi.mocked(prisma.agentToken.findFirst).mockResolvedValue(principal as never)
    expect(
      (await call("publish_article", { slug: "example", version })).status
    ).toBe(403)
    vi.mocked(prisma.article.findUnique).mockResolvedValueOnce({
      draft: false,
      version,
    } as never)
    expect(
      (await call("edit_article", { slug: "example", version, title: "new" }))
        .status
    ).toBe(403)
  })

  it("keeps drafts out of read-only access", async () => {
    vi.mocked(prisma.agentToken.findFirst).mockResolvedValue({
      ...principal,
      access: "READ",
    } as never)
    vi.mocked(prisma.article.findMany).mockResolvedValue([] as never)
    expect((await call("list_articles", {})).status).toBe(200)
    expect((await call("list_articles", { draft: true })).status).toBe(403)
  })

  it("counts only published articles when a read-only token lists tags", async () => {
    vi.mocked(prisma.agentToken.findFirst).mockResolvedValueOnce({
      ...principal,
      access: "READ",
    } as never)
    vi.mocked(prisma.article.findMany).mockResolvedValueOnce([])
    expect((await call("list_tags", {})).status).toBe(200)
    expect(prisma.article.findMany).toHaveBeenLastCalledWith(
      expect.objectContaining({ where: { draft: false } })
    )
  })

  it("rejects a stale edit and rejects draft status in an edit payload", async () => {
    vi.mocked(prisma.agentToken.findFirst).mockResolvedValue(principal as never)
    vi.mocked(prisma.article.findUnique).mockResolvedValueOnce({
      draft: true,
      version: "newer",
    } as never)
    expect(
      (await call("edit_article", { slug: "example", version, title: "new" }))
        .status
    ).toBe(409)
    expect(
      (await call("edit_article", { slug: "example", version, draft: false }))
        .status
    ).toBe(400)
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
