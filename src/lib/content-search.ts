import type { Article, Prisma } from "@prisma/client"

export function buildSearchDocument(input: {
  title: string
  desc: string
  category: string
  tags: string[]
  content: string
}) {
  return [
    input.title,
    input.desc,
    input.category,
    input.tags.join(" "),
    input.content,
  ]
    .join(" ")
    .trim()
}

export async function createArticleRevisionSnapshot(
  tx: Prisma.TransactionClient,
  article: Pick<
    Article,
    | "id"
    | "title"
    | "desc"
    | "content"
    | "category"
    | "tags"
    | "cover"
    | "draft"
    | "publishedAt"
  >,
  editorUserId: string | null,
  reason?: string
) {
  await tx.articleRevision.create({
    data: {
      articleId: article.id,
      title: article.title,
      desc: article.desc,
      content: article.content,
      category: article.category,
      tags: article.tags,
      cover: article.cover,
      draft: article.draft,
      publishedAt: article.publishedAt,
      createdByUserId: editorUserId,
      reason,
    },
  })
}
