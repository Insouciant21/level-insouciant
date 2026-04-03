import { CommentStatus } from "@prisma/client"

import { getManagedArticles, getManagedTags } from "@/lib/content-admin"
import { prisma } from "@/lib/prisma"

export type AdminCommentItem = {
  id: string
  articleSlug: string
  authorName: string
  content: string
  status: CommentStatus
  createdAt: string
}

export async function getDashboardOverview() {
  const [articles, tags] = await Promise.all([getManagedArticles(), getManagedTags()])
  const publishedCount = articles.filter((article) => !article.draft).length
  const draftCount = articles.length - publishedCount

  if (!process.env.DATABASE_URL) {
    return {
      publishedCount,
      draftCount,
      tagsCount: tags.length,
      totalViews: 0,
      totalLikes: 0,
      totalComments: 0,
      hiddenComments: 0,
      usersCount: 0,
    }
  }

  const [totalViews, totalLikes, totalComments, hiddenComments, usersCount] = await Promise.all([
    prisma.pageView.count(),
    prisma.articleLike.count(),
    prisma.comment.count({
      where: {
        status: CommentStatus.APPROVED,
      },
    }),
    prisma.comment.count({
      where: {
        status: CommentStatus.HIDDEN,
      },
    }),
    prisma.user.count(),
  ])

  return {
    publishedCount,
    draftCount,
    tagsCount: tags.length,
    totalViews,
    totalLikes,
    totalComments,
    hiddenComments,
    usersCount,
  }
}

export async function getArticleStats() {
  const articles = await getManagedArticles()

  if (!process.env.DATABASE_URL) {
    return articles.map((article) => ({
      ...article,
      views: 0,
      likes: 0,
      comments: 0,
      hiddenComments: 0,
    }))
  }

  const [viewGroups, likeGroups, commentGroups] = await Promise.all([
    prisma.pageView.groupBy({
      by: ["articleSlug"],
      _count: {
        _all: true,
      },
    }),
    prisma.articleLike.groupBy({
      by: ["articleSlug"],
      _count: {
        _all: true,
      },
    }),
    prisma.comment.groupBy({
      by: ["articleSlug", "status"],
      _count: {
        _all: true,
      },
    }),
  ])

  const viewsMap = new Map(viewGroups.map((entry) => [entry.articleSlug, entry._count._all]))
  const likesMap = new Map(likeGroups.map((entry) => [entry.articleSlug, entry._count._all]))
  const approvedCommentsMap = new Map<string, number>()
  const hiddenCommentsMap = new Map<string, number>()

  for (const entry of commentGroups) {
    if (entry.status === CommentStatus.HIDDEN) {
      hiddenCommentsMap.set(entry.articleSlug, entry._count._all)
    } else {
      approvedCommentsMap.set(entry.articleSlug, entry._count._all)
    }
  }

  return articles
    .map((article) => ({
      ...article,
      views: viewsMap.get(article.slug) ?? 0,
      likes: likesMap.get(article.slug) ?? 0,
      comments: approvedCommentsMap.get(article.slug) ?? 0,
      hiddenComments: hiddenCommentsMap.get(article.slug) ?? 0,
    }))
    .sort((a, b) => b.views - a.views || b.likes - a.likes || a.title.localeCompare(b.title))
}

export async function getAdminComments() {
  if (!process.env.DATABASE_URL) {
    return [] as AdminCommentItem[]
  }

  const comments = await prisma.comment.findMany({
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      articleSlug: true,
      authorName: true,
      content: true,
      status: true,
      createdAt: true,
    },
  })

  return comments.map((comment) => ({
    ...comment,
    createdAt: comment.createdAt.toISOString(),
  })) satisfies AdminCommentItem[]
}

export async function setCommentStatus(commentId: string, status: CommentStatus) {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_NOT_CONFIGURED")
  }

  await prisma.comment.update({
    where: {
      id: commentId,
    },
    data: {
      status,
    },
  })
}

export async function deleteCommentForAdmin(commentId: string) {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_NOT_CONFIGURED")
  }

  await prisma.comment.delete({
    where: {
      id: commentId,
    },
  })
}
