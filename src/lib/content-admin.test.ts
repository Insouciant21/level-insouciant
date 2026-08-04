import { beforeEach, describe, expect, it, vi } from "vitest"

import { prisma } from "@/lib/prisma"
import { createManagedArticle } from "@/lib/content-admin"

vi.mock("@/lib/prisma", () => ({
  prisma: {
    article: {
      create: vi.fn(),
      findUnique: vi.fn(),
    },
    articleRevision: {
      create: vi.fn(),
    },
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
  },
  articleRevision: {
    create: vi.fn(),
  },
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(prisma.article.findUnique).mockResolvedValue(null)
  tx.article.create.mockResolvedValue(article)
  tx.articleRevision.create.mockResolvedValue({})
  vi.mocked(prisma.$transaction).mockImplementation(async (callback) =>
    callback(tx as never)
  )
})

describe("managed article content helpers", () => {
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
