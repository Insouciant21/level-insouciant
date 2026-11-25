import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import { z } from "zod"

const baseUrl = (process.env.BLOG_URL ?? "http://127.0.0.1:4321").replace(
  /\/$/,
  ""
)
const token = process.env.BLOG_AGENT_TOKEN
if (!token) throw new Error("BLOG_AGENT_TOKEN is required")

async function callBlog(tool, args) {
  const response = await fetch(`${baseUrl}/api/agent/articles`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({ tool, arguments: args }),
  })
  const data = await response
    .json()
    .catch(() => ({ error: "INVALID_RESPONSE" }))
  if (!response.ok)
    throw new Error(
      `${data.error ?? "AGENT_REQUEST_FAILED"} (${response.status})`
    )
  return data
}

const server = new McpServer({ name: "level-insouciant", version: "0.1.0" })
const slug = z.string().min(1)
const target = { slug, version: z.string().uuid() }
const articleFields = {
  title: z.string().min(1).optional(),
  desc: z.string().min(1).optional(),
  category: z.string().min(1).optional(),
  tags: z.array(z.string()).min(1).optional(),
  content: z.string().min(1).optional(),
}

server.registerTool(
  "list_articles",
  {
    description: "List blog articles.",
    inputSchema: {
      query: z.string().optional(),
      draft: z.boolean().optional(),
      offset: z.number().int().nonnegative().optional(),
    },
  },
  async (args) => ({
    content: [
      {
        type: "text",
        text: JSON.stringify(await callBlog("list_articles", args)),
      },
    ],
  })
)
server.registerTool(
  "list_tags",
  { description: "List existing blog tags.", inputSchema: {} },
  async () => ({
    content: [
      { type: "text", text: JSON.stringify(await callBlog("list_tags", {})) },
    ],
  })
)
server.registerTool(
  "get_article",
  { description: "Read one full blog article.", inputSchema: { slug } },
  async (args) => ({
    content: [
      {
        type: "text",
        text: JSON.stringify(await callBlog("get_article", args)),
      },
    ],
  })
)
server.registerTool(
  "create_draft",
  {
    description: "Create a Markdown blog draft.",
    inputSchema: {
      slug,
      title: z.string().min(1),
      desc: z.string().min(1),
      category: z.string().min(1),
      tags: z.array(z.string()).min(1),
      content: z.string().min(1),
    },
  },
  async (args) => ({
    content: [
      {
        type: "text",
        text: JSON.stringify(await callBlog("create_draft", args)),
      },
    ],
  })
)
server.registerTool(
  "edit_article",
  {
    description:
      "Edit supplied fields of a blog article. Content replaces the full Markdown body.",
    inputSchema: { ...target, ...articleFields },
  },
  async (args) => ({
    content: [
      {
        type: "text",
        text: JSON.stringify(await callBlog("edit_article", args)),
      },
    ],
  })
)
server.registerTool(
  "publish_article",
  { description: "Publish a specific article version.", inputSchema: target },
  async (args) => ({
    content: [
      {
        type: "text",
        text: JSON.stringify(await callBlog("publish_article", args)),
      },
    ],
  })
)
server.registerTool(
  "unpublish_article",
  {
    description: "Move a specific article back to drafts.",
    inputSchema: target,
  },
  async (args) => ({
    content: [
      {
        type: "text",
        text: JSON.stringify(await callBlog("unpublish_article", args)),
      },
    ],
  })
)

await server.connect(new StdioServerTransport())
