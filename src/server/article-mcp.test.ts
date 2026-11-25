import { Client } from "@modelcontextprotocol/sdk/client/index.js"
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js"
import { expect, it, vi } from "vitest"
import { agentTools } from "@/lib/agent-contract"
import { prisma } from "@/lib/prisma"
import { handleArticleMcp } from "./article-mcp"

vi.mock("@/lib/prisma", () => ({
  prisma: {
    article: { findMany: vi.fn() },
    agentToken: { findFirst: vi.fn() },
  },
}))

const url = new URL("https://blog.example/mcp")
const authorization = `Bearer li_${"a".repeat(43)}`

it("requires a bearer credential before protocol negotiation", async () => {
  const response = await handleArticleMcp(
    new Request(url, { method: "POST", headers: { cookie: "session=test" } })
  )
  expect(response.status).toBe(401)
  expect(response.headers.get("www-authenticate")).toMatch(/^Bearer /)
})

it("requires an active credential belonging to a current administrator", async () => {
  vi.mocked(prisma.agentToken.findFirst).mockResolvedValueOnce(null)
  const response = await handleArticleMcp(
    new Request(url, { method: "POST", headers: { authorization } })
  )
  expect(response.status).toBe(401)
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

it("supports discovery and calls with the standard HTTP client and rechecks authorization between requests", async () => {
  const article = {
    slug: "first",
    title: "First article",
    draft: false,
    version: "revision",
  }
  vi.mocked(prisma.article.findMany).mockResolvedValue([article] as never)
  vi.mocked(prisma.agentToken.findFirst).mockResolvedValue({
    id: "token",
    name: "writer",
    ownerId: "admin",
    access: "DRAFT",
  } as never)
  const client = new Client({ name: "article-mcp-test", version: "1" })
  const transport = new StreamableHTTPClientTransport(url, {
    requestInit: { headers: { authorization } },
    fetch: (input, init) => handleArticleMcp(new Request(input, init)),
  })
  try {
    await client.connect(transport)
    expect(transport.sessionId).toBeUndefined()
    const { tools } = await client.listTools()
    expect(tools.map(({ name }) => name).sort()).toEqual(
      Object.keys(agentTools).sort()
    )
    const result = await client.callTool({
      name: "list_articles",
      arguments: {},
    })
    expect(result.content).toEqual([
      {
        type: "text",
        text: JSON.stringify({ articles: [article], nextOffset: null }),
      },
    ])
    const denied = await client.callTool({
      name: "publish_article",
      arguments: {
        slug: "first",
        version: "e135b281-f36d-4bd1-8f7d-757786653925",
      },
    })
    expect(denied.isError).toBe(true)
    expect(denied.content).toEqual([
      { type: "text", text: "PUBLISH_ACCESS_REQUIRED" },
    ])
    vi.mocked(prisma.agentToken.findFirst).mockResolvedValue(null)
    await expect(client.listTools()).rejects.toThrow()
  } finally {
    await client.close()
  }
})

it("advertises POST when a client probes for a standalone event stream", async () => {
  const response = await handleArticleMcp(new Request(url))
  expect(response.status).toBe(405)
  expect(response.headers.get("allow")).toBe("POST")
})
