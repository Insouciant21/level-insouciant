import type { Article } from "@prisma/client"
import { ZodError } from "zod"
import { agentTools } from "@/lib/agent-contract"
import type { authenticateAgent } from "@/lib/agent-tokens"
import {
  createManagedArticle,
  updateManagedArticle,
  setArticleDraftState,
  getManagedTags,
} from "@/lib/content-admin"
import { prisma } from "@/lib/prisma"

type Principal = NonNullable<Awaited<ReturnType<typeof authenticateAgent>>>
class AgentError extends Error {}

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
    if (error instanceof ZodError) throw new AgentError("INVALID_ARGUMENTS")
    if (error instanceof Error) {
      if (error.message === "ARTICLE_NOT_FOUND")
        throw new AgentError(error.message)
      if (
        error.message === "ARTICLE_SLUG_TAKEN" ||
        ("code" in error && error.code === "P2002")
      )
        throw new AgentError("ARTICLE_SLUG_TAKEN")
      if ("code" in error && error.code === "P2025")
        throw new AgentError("VERSION_CONFLICT")
    }
    throw new AgentError("AGENT_REQUEST_FAILED")
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
        throw new AgentError("DRAFT_ACCESS_REQUIRED")
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
      if (!article) throw new AgentError("ARTICLE_NOT_FOUND")
      if (article.draft && agent.access === "READ") {
        throw new AgentError("DRAFT_ACCESS_REQUIRED")
      }
      return { ...article, ...receipt(article) }
    }
    case "create_draft": {
      if (agent.access === "READ") throw new AgentError("DRAFT_ACCESS_REQUIRED")
      const input = agentTools.create_draft.schema.parse(args)
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
      if (agent.access === "READ") throw new AgentError("DRAFT_ACCESS_REQUIRED")
      const { slug, version, ...changes } =
        agentTools.edit_article.schema.parse(args)
      if (!Object.keys(changes).length) throw new AgentError("NO_CHANGES")
      const current = await prisma.article.findUnique({ where: { slug } })
      if (!current) throw new AgentError("ARTICLE_NOT_FOUND")
      if (!current.draft && agent.access !== "PUBLISH")
        throw new AgentError("PUBLISH_ACCESS_REQUIRED")
      if (current.version !== version) throw new AgentError("VERSION_CONFLICT")
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
        throw new AgentError("PUBLISH_ACCESS_REQUIRED")
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
      throw new AgentError("UNKNOWN_TOOL")
  }
}
