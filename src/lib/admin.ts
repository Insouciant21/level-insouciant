import { cache } from "react"

import { getManagedArticles } from "@/lib/content-admin"
import { prisma } from "@/lib/prisma"

export const COMMENT_STATUS = {
  APPROVED: "APPROVED",
  HIDDEN: "HIDDEN",
} as const

export type CommentStatus = (typeof COMMENT_STATUS)[keyof typeof COMMENT_STATUS]

export type DashboardOverview = {
  publishedCount: number
  draftCount: number
  tagsCount: number
  totalViews: number
  totalLikes: number
  totalComments: number
  hiddenComments: number
  usersCount: number
}

export type ArticleStatItem = Awaited<ReturnType<typeof getManagedArticles>>[number] & {
  views: number
  likes: number
  comments: number
  hiddenComments: number
}

export type AdminCommentItem = {
  id: string
  articleSlug: string
  authorName: string
  content: string
  status: CommentStatus
  createdAt: string
  parentId: string | null
  parentAuthorName: string | null
  repliesCount: number
}

type AdminCommentRecord = {
  id: string
  articleSlug: string
  authorName: string
  content: string
  status: CommentStatus
  createdAt: Date
  parentId: string | null
  parent: {
    authorName: string
  } | null
  _count: {
    replies: number
  }
}

type CountGroupRecord = {
  articleSlug: string
  _count: {
    _all: number
  }
}

type CommentCountGroupRecord = CountGroupRecord & {
  status: CommentStatus
}

export const getDashboardOverview = cache(async function getDashboardOverview(): Promise<DashboardOverview> {
  const articles = await getManagedArticles()
  const publishedCount = articles.filter((article) => !article.draft).length
  const draftCount = articles.length - publishedCount
  const tagsCount = new Set(articles.flatMap((article) => article.tags)).size

  if (!process.env.DATABASE_URL) {
    return {
      publishedCount,
      draftCount,
      tagsCount,
      totalViews: 0,
      totalLikes: 0,
      totalComments: 0,
      hiddenComments: 0,
      usersCount: 0,
    }
  }

  const [totalViews, totalLikes, commentGroups, usersCount] = await Promise.all([
    prisma.pageView.count(),
    prisma.articleLike.count(),
    prisma.comment.groupBy({
      by: ["status"],
      _count: {
        _all: true,
      },
    }),
    prisma.user.count(),
  ])
  const totalComments = commentGroups.find((entry) => entry.status === COMMENT_STATUS.APPROVED)?._count._all ?? 0
  const hiddenComments = commentGroups.find((entry) => entry.status === COMMENT_STATUS.HIDDEN)?._count._all ?? 0

  return {
    publishedCount,
    draftCount,
    tagsCount,
    totalViews,
    totalLikes,
    totalComments,
    hiddenComments,
    usersCount,
  }
})

export const getArticleStats = cache(async function getArticleStats(): Promise<ArticleStatItem[]> {
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

  const [viewGroups, likeGroups, commentGroups]: [
    CountGroupRecord[],
    CountGroupRecord[],
    CommentCountGroupRecord[],
  ] = await Promise.all([
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
    if (entry.status === COMMENT_STATUS.HIDDEN) {
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
    .sort((left, right) => right.views - left.views || right.likes - left.likes || left.title.localeCompare(right.title))
})

export const getAdminComments = cache(async function getAdminComments(): Promise<AdminCommentItem[]> {
  if (!process.env.DATABASE_URL) {
    return [] as AdminCommentItem[]
  }

  const comments: AdminCommentRecord[] = await prisma.comment.findMany({
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
      parentId: true,
      parent: {
        select: {
          authorName: true,
        },
      },
      _count: {
        select: {
          replies: true,
        },
      },
    },
  })

  return comments.map((comment) => ({
    id: comment.id,
    articleSlug: comment.articleSlug,
    authorName: comment.authorName,
    content: comment.content,
    status: comment.status,
    createdAt: comment.createdAt.toISOString(),
    parentId: comment.parentId,
    parentAuthorName: comment.parent?.authorName ?? null,
    repliesCount: comment._count.replies,
  })) satisfies AdminCommentItem[]
})

export async function setCommentStatus(commentId: string, status: CommentStatus) {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_NOT_CONFIGURED")
  }

  const threadIds = await getCommentThreadIds(commentId)

  await prisma.comment.updateMany({
    where: {
      id: {
        in: threadIds,
      },
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

  const threadIds = await getCommentThreadIds(commentId)

  await prisma.comment.deleteMany({
    where: {
      id: {
        in: threadIds,
      },
    },
  })
}

async function getCommentThreadIds(rootId: string): Promise<string[]> {
  const ids = new Set<string>([rootId])
  let frontier = [rootId]

  while (frontier.length > 0) {
    const children = await prisma.comment.findMany({
      where: {
        parentId: {
          in: frontier,
        },
      },
      select: {
        id: true,
      },
    })

    frontier = children
      .map((comment) => comment.id)
      .filter((id) => {
        if (ids.has(id)) {
          return false
        }

        ids.add(id)
        return true
      })
  }

  return [...ids]
}
