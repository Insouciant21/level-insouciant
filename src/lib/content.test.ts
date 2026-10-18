import type { APIContext } from "astro"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { prisma } from "@/lib/prisma"
import { requestStorage } from "@/server/request-context"
import {
  getAllArticles,
  getArticleBySlug,
  getArticleSummaryBySlug,
  isArticlePublished,
} from "./content"

vi.mock("@/lib/prisma", () => ({
  prisma: {
    article: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}))

const summaryRecord = {
  archiveNumber: 1n,
  slug: "first-article",
  title: "First article",
  desc: "Description",
  publishedAt: new Date("2026-08-04T00:00:00.000Z"),
  tags: ["notes"],
  category: "Notes",
  cover: null,
  draft: false,
}

const detailRecord = {
  ...summaryRecord,
  content: "Article body",
}

function runRequest<T>(callback: () => Promise<T>) {
  return requestStorage.run(
    {
      context: {} as APIContext,
      memo: new Map(),
      headers: new Headers(),
    },
    callback
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(prisma.article.findMany).mockResolvedValue([summaryRecord] as never)
  vi.mocked(prisma.article.findUnique).mockResolvedValue(detailRecord as never)
})

describe("public article content queries", () => {
  it("loads only summary fields for article listings", async () => {
    const articles = await getAllArticles()

    expect(articles).toMatchObject([{ slug: "first-article" }])
    expect(prisma.article.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        select: expect.objectContaining({
          archiveNumber: true,
          slug: true,
        }),
      })
    )
    const listCall = vi.mocked(prisma.article.findMany).mock.calls.at(0)
    expect(listCall).toBeDefined()
    const listSelect = listCall![0]!.select as Record<string, unknown>
    expect(listSelect).not.toHaveProperty("content")
    expect(listSelect).not.toHaveProperty("searchDocument")
  })

  it("reuses one summary listing query within a request", async () => {
    await runRequest(async () => {
      await getAllArticles()
      await getAllArticles()
      await getAllArticles({ includeDrafts: false })
    })

    expect(prisma.article.findMany).toHaveBeenCalledTimes(1)
  })

  it("keeps separate cache entries for draft-inclusive listings", async () => {
    await runRequest(async () => {
      await getAllArticles()
      await getAllArticles({ includeDrafts: true })
    })

    expect(prisma.article.findMany).toHaveBeenCalledTimes(2)
    expect(prisma.article.findMany).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ where: undefined })
    )
  })

  it("loads content only for the full article detail query", async () => {
    await getArticleBySlug("first-article")

    expect(prisma.article.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        select: expect.objectContaining({ content: true }),
      })
    )
    const detailCall = vi.mocked(prisma.article.findUnique).mock.calls.at(0)
    expect(detailCall).toBeDefined()
    const detailSelect = detailCall![0].select as Record<string, unknown>
    expect(detailSelect).not.toHaveProperty("searchDocument")
  })

  it("provides a summary-only reader for Open Graph images", async () => {
    await getArticleSummaryBySlug("first-article")

    expect(prisma.article.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        select: expect.objectContaining({ slug: true }),
      })
    )
    const summaryCall = vi.mocked(prisma.article.findUnique).mock.calls.at(0)
    expect(summaryCall).toBeDefined()
    const summarySelect = summaryCall![0].select as Record<string, unknown>
    expect(summarySelect).not.toHaveProperty("content")
    expect(summarySelect).not.toHaveProperty("searchDocument")
  })

  it("checks publication state without loading the article body", async () => {
    vi.mocked(prisma.article.findUnique).mockResolvedValue({
      draft: false,
    } as never)

    await expect(isArticlePublished("first-article")).resolves.toBe(true)
    expect(prisma.article.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        select: { draft: true },
      })
    )
  })
})
