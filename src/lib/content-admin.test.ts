import { beforeEach, describe, expect, it, vi } from "vitest"

import { prisma } from "@/lib/prisma"
import {
  createManagedArticle,
  deleteArticleBySlug,
  removeTagAcrossArticles,
  renameTagAcrossArticles,
  restoreArticleRevision,
  setArticleDraftState,
  updateManagedArticle,
} from "@/lib/content-admin"
import { publicPageCache } from "@/server/public-page-cache"

vi.mock("@/lib/prisma", () => ({
  prisma: {
    article: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      delete: vi.fn(),
    },
    articleRevision: {
      create: vi.fn(),
      findFirst: vi.fn(),
      deleteMany: vi.fn(),
    },
    pageView: { deleteMany: vi.fn() },
    articleLike: { deleteMany: vi.fn() },
    comment: { deleteMany: vi.fn() },
    $transaction: vi.fn(),
  },
}))

const article = {
  id: "article-1",
  slug: "first-article",
  title: "First article",
  desc: "Description",
  content: "Body",
  category: "Notes",
  tags: ["tag"],
  cover: null,
  searchDocument: "First article Description Notes tag Body",
  draft: true,
  publishedAt: new Date("2026-08-04T00:00:00.000Z"),
  legacySourcePath: null,
  lastEditedByUserId: "admin-1",
  createdAt: new Date("2026-08-04T00:00:00.000Z"),
  updatedAt: new Date("2026-08-04T00:00:00.000Z"),
}

const tx = {
  article: {
    create: vi.fn(),
    update: vi.fn(),
  },
  articleRevision: {
    create: vi.fn(),
  },
}

beforeEach(() => {
  vi.clearAllMocks()
  publicPageCache.clear()
  vi.mocked(prisma.article.findUnique).mockResolvedValue(null)
  vi.mocked(prisma.article.findMany).mockResolvedValue([article] as never)
  vi.mocked(prisma.articleRevision.findFirst).mockResolvedValue({
    ...article,
    id: "revision-1",
  } as never)
  tx.article.create.mockResolvedValue(article)
  tx.article.update.mockResolvedValue(article)
  tx.articleRevision.create.mockResolvedValue({})
  vi.mocked(prisma.$transaction).mockImplementation(async (callback) =>
    typeof callback === "function"
      ? callback(tx as never)
      : Promise.all(callback)
  )
})

const input = {
  slug: "first-article",
  title: "First article",
  desc: "Description",
  content: "Updated body",
  category: "Notes",
  tags: ["tag"],
  cover: "",
  publishedAt: "2026-08-04T00:00:00.000Z",
  draft: false,
}

async function readPublicPage(path: string) {
  const response = await publicPageCache.respond(
    new Request("https://blog.moeblue.top" + path),
    async () =>
      new Response("article", { headers: { "content-type": "text/html" } })
  )
  await response.text()
  return response.headers.get("x-page-cache")
}

describe("managed article content helpers", () => {
  it.each([
    [
      "create",
      async () => {
        vi.mocked(prisma.article.findUnique).mockResolvedValueOnce(null)
        await createManagedArticle(input, "admin-1")
      },
    ],
    ["update", () => updateManagedArticle(article.slug, input, "admin-1")],
    ["publish", () => setArticleDraftState(article.slug, false, "admin-1")],
    ["hide", () => setArticleDraftState(article.slug, true, "admin-1")],
    ["delete", () => deleteArticleBySlug(article.slug)],
    ["rename tag", () => renameTagAcrossArticles("tag", "renamed", "admin-1")],
    ["remove tag", () => removeTagAcrossArticles("tag", "admin-1")],
    [
      "restore revision",
      () => restoreArticleRevision(article.slug, "revision-1", "admin-1"),
    ],
  ] as const)(
    "refreshes public articles and listings after %s",
    async (_name, mutate) => {
      vi.mocked(prisma.article.findUnique).mockResolvedValue(article as never)
      for (const path of ["/articles/first-article", "/"]) {
        expect(await readPublicPage(path)).toBe("MISS")
        expect(await readPublicPage(path)).toBe("HIT")
      }
      await mutate()
      for (const path of ["/articles/first-article", "/"]) {
        expect(await readPublicPage(path)).toBe("MISS")
      }
    }
  )

  it("leaves cached pages intact when a content transaction fails", async () => {
    expect(await readPublicPage("/")).toBe("MISS")
    vi.mocked(prisma.$transaction).mockRejectedValueOnce(
      new Error("commit failed")
    )
    await expect(createManagedArticle(input, "admin-1")).rejects.toThrow(
      "commit failed"
    )
    expect(await readPublicPage("/")).toBe("HIT")
  })

  it("keeps search documents and revision snapshots when creating an article", async () => {
    await createManagedArticle(
      {
        slug: "first-article",
        title: "First article",
        desc: "Description",
        content: "Body",
        category: "Notes",
        tags: ["tag"],
        cover: "",
        publishedAt: "2026-08-04T00:00:00.000Z",
        draft: true,
      },
      "admin-1"
    )

    expect(tx.article.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        searchDocument: "First article Description Notes tag Body",
      }),
    })
    expect(tx.articleRevision.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        articleId: article.id,
        reason: "Article created",
      }),
    })
  })
})
