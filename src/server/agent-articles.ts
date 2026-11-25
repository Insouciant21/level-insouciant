import type { Article } from "@prisma/client"
import { ZodError } from "zod"
import { visit } from "unist-util-visit"
import { agentTools } from "@/lib/agent-contract"
import { authenticateAgent } from "@/lib/agent-tokens"
import {
  createManagedArticle,
  updateManagedArticle,
  setArticleDraftState,
  getManagedTags,
} from "@/lib/content-admin"
import { normalizeMdxSource, parseMdxTree } from "@/lib/mdx"
import { prisma } from "@/lib/prisma"

type Principal = NonNullable<Awaited<ReturnType<typeof authenticateAgent>>>
class AgentError extends Error {
  constructor(
    readonly status: number,
    message: string
  ) {
    super(message)
  }
}

export async function validateAgentMarkdown(source: string) {
  try {
    for (const input of new Set([source, normalizeMdxSource(source)])) {
      visit(parseMdxTree(input), (node) => {
        if (node.type.startsWith("mdx") || node.type === "html")
          throw new Error("MDX")
        if (
          "url" in node &&
          typeof node.url === "string" &&
          !["https:", "http:", "mailto:"].includes(
            new URL(node.url, "https://blog.invalid").protocol
          )
        )
          throw new Error("URL")
      })
    }
  } catch {
    throw new AgentError(400, "MARKDOWN_REQUIRED")
  }
}

const summary = { slug: true, title: true, draft: true, version: true } as const

function receipt(article: Pick<Article, keyof typeof summary>) {
  const { slug, title, draft, version } = article
  const path = `/articles/${encodeURIComponent(slug)}`
  return {
    slug,
    title,
    draft,
    version,
    editPath: `/admin${path}/edit`,
    publicPath: draft ? null : path,
  }
}

export async function runArticleTool(
  agent: Principal,
  tool: string,
  args: unknown
) {
  try {
    return await dispatchArticleTool(agent, tool, args)
  } catch (error) {
    if (error instanceof AgentError) throw error
    if (error instanceof ZodError)
      throw new AgentError(400, "INVALID_ARGUMENTS")
    if (error instanceof Error) {
      if (error.message === "ARTICLE_NOT_FOUND")
        throw new AgentError(404, error.message)
      if (
        error.message === "ARTICLE_SLUG_TAKEN" ||
        ("code" in error && error.code === "P2002")
      )
        throw new AgentError(409, "ARTICLE_SLUG_TAKEN")
      if ("code" in error && error.code === "P2025")
        throw new AgentError(409, "VERSION_CONFLICT")
    }
    throw new AgentError(500, "AGENT_REQUEST_FAILED")
  }
}

async function dispatchArticleTool(
  agent: Principal,
  tool: string,
  args: unknown
) {
  const reason = `${tool} · ${agent.name} (${agent.id})`
  switch (tool) {
    case "list_articles": {
      const {
        query,
        draft,
        offset = 0,
      } = agentTools.list_articles.schema.parse(args)
      if (agent.access === "READ" && draft === true) {
        throw new AgentError(403, "DRAFT_ACCESS_REQUIRED")
      }
      const articles = await prisma.article.findMany({
        where: {
          draft: agent.access === "READ" ? false : draft,
          ...(query && {
            OR: [
              {
                searchDocument: {
                  contains: query,
                  mode: "insensitive" as const,
                },
              },
              { slug: { contains: query, mode: "insensitive" as const } },
            ],
          }),
        },
        select: summary,
        orderBy: [{ updatedAt: "desc" }, { id: "asc" }],
        skip: offset,
        take: 51,
      })
      return {
        articles: articles.slice(0, 50),
        nextOffset: articles.length > 50 ? offset + 50 : null,
      }
    }
    case "list_tags":
      agentTools.list_tags.schema.parse(args)
      return (await getManagedTags(agent.access !== "READ")).map(
        ({ name, count }) => ({
          name,
          count,
        })
      )
    case "get_article": {
      const { slug } = agentTools.get_article.schema.parse(args)
      const article = await prisma.article.findUnique({
        where: { slug },
        select: {
          ...summary,
          content: true,
          category: true,
          tags: true,
          desc: true,
          cover: true,
          publishedAt: true,
        },
      })
      if (!article) throw new AgentError(404, "ARTICLE_NOT_FOUND")
      if (article.draft && agent.access === "READ") {
        throw new AgentError(403, "DRAFT_ACCESS_REQUIRED")
      }
      return { ...article, ...receipt(article) }
    }
    case "create_draft": {
      if (agent.access === "READ")
        throw new AgentError(403, "DRAFT_ACCESS_REQUIRED")
      const input = agentTools.create_draft.schema.parse(args)
      await validateAgentMarkdown(input.content)
      return receipt(
        await createManagedArticle(
          {
            ...input,
            cover: "",
            publishedAt: new Date().toISOString(),
            draft: true,
          },
          agent.ownerId,
          reason
        )
      )
    }
    case "edit_article": {
      if (agent.access === "READ")
        throw new AgentError(403, "DRAFT_ACCESS_REQUIRED")
      const { slug, version, ...changes } =
        agentTools.edit_article.schema.parse(args)
      if (!Object.keys(changes).length) throw new AgentError(400, "NO_CHANGES")
      const current = await prisma.article.findUnique({ where: { slug } })
      if (!current) throw new AgentError(404, "ARTICLE_NOT_FOUND")
      if (!current.draft && agent.access !== "PUBLISH")
        throw new AgentError(403, "PUBLISH_ACCESS_REQUIRED")
      if (current.version !== version)
        throw new AgentError(409, "VERSION_CONFLICT")
      if (changes.content !== undefined)
        await validateAgentMarkdown(changes.content)
      return receipt(
        await updateManagedArticle(
          slug,
          {
            ...current,
            cover: current.cover ?? "",
            publishedAt: current.publishedAt.toISOString(),
            ...changes,
          },
          agent.ownerId,
          { version, draft: current.draft, reason }
        )
      )
    }
    case "publish_article":
    case "unpublish_article": {
      if (agent.access !== "PUBLISH")
        throw new AgentError(403, "PUBLISH_ACCESS_REQUIRED")
      const { slug, version } = agentTools[tool].schema.parse(args)
      return receipt(
        await setArticleDraftState(
          slug,
          tool === "unpublish_article",
          agent.ownerId,
          { version, reason }
        )
      )
    }
    default:
      throw new AgentError(400, "UNKNOWN_TOOL")
  }
}

function failure(status: number, error: string) {
  return Response.json(
    { error },
    {
      status,
      headers:
        status === 401
          ? { "WWW-Authenticate": 'Bearer realm="blog-articles"' }
          : {},
    }
  )
}

export async function handleAgentRequest(request: Request) {
  try {
    const agent = await authenticateAgent(request)
    if (!agent) return failure(401, "INVALID_TOKEN")
    if (
      request.headers.get("content-type")?.split(";")[0].trim() !==
      "application/json"
    )
      return failure(415, "JSON_REQUIRED")
    const body = await request.json().catch(() => null)
    if (typeof body?.tool !== "string") return failure(400, "INVALID_REQUEST")
    return Response.json(await runArticleTool(agent, body.tool, body.arguments))
  } catch (error) {
    if (error instanceof AgentError) return failure(error.status, error.message)
    return failure(500, "AGENT_REQUEST_FAILED")
  }
}
