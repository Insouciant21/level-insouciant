import { prisma } from "@/lib/prisma"

export const BEHAVIOR_VISITOR_COOKIE = "level_insouciant_behavior_id"

const APPROVED_COMMENT_STATUS = "APPROVED" as const

export type EngagementSnapshot = {
  views: number
  likes: number
  commentsCount: number
  likedByViewer: boolean
}

export type PublicComment = {
  id: string
  authorName: string
  content: string
  createdAt: string
  parentId: string | null
  replyToAuthorName: string | null
  replies: PublicComment[]
}

type PublicCommentRecord = {
  id: string
  authorName: string
  content: string
  createdAt: Date
  parentId: string | null
  parent: {
    id: string
    authorName: string
  } | null
}

type CreatedCommentRecord = {
  id: string
  authorName: string
  content: string
  createdAt: Date
  parentId: string | null
  parent: {
    authorName: string
  } | null
}

export function isBehaviorStorageEnabled() {
  return Boolean(process.env.DATABASE_URL)
}

export async function getEngagementSnapshot(
  articleSlug: string,
  viewerId?: string
): Promise<EngagementSnapshot> {
  if (!isBehaviorStorageEnabled()) {
    return emptySnapshot()
  }

  try {
    const [views, likes, commentsCount, existingLike] = await Promise.all([
      prisma.pageView.count({
        where: { articleSlug },
      }),
      prisma.articleLike.count({
        where: { articleSlug },
      }),
      prisma.comment.count({
        where: {
          articleSlug,
          status: APPROVED_COMMENT_STATUS,
        },
      }),
      viewerId
        ? prisma.articleLike.findUnique({
            where: {
              articleSlug_viewerId: {
                articleSlug,
                viewerId,
              },
            },
            select: {
              id: true,
            },
          })
        : Promise.resolve(null),
    ])

    return {
      views,
      likes,
      commentsCount,
      likedByViewer: Boolean(existingLike),
    } satisfies EngagementSnapshot
  } catch {
    return emptySnapshot()
  }
}

export async function recordPageView(articleSlug: string, viewerId: string): Promise<{ views: number }> {
  if (!isBehaviorStorageEnabled()) {
    return { views: 0 }
  }

  try {
    await prisma.pageView.create({
      data: {
        articleSlug,
        viewerId,
      },
    })

    const views = await prisma.pageView.count({
      where: { articleSlug },
    })

    return { views }
  } catch {
    return { views: 0 }
  }
}

export async function toggleLike(
  articleSlug: string,
  viewerId: string
): Promise<{ likes: number; likedByViewer: boolean }> {
  if (!isBehaviorStorageEnabled()) {
    return {
      likes: 0,
      likedByViewer: false,
    }
  }

  try {
    const existing = await prisma.articleLike.findUnique({
      where: {
        articleSlug_viewerId: {
          articleSlug,
          viewerId,
        },
      },
      select: {
        id: true,
      },
    })

    if (existing) {
      await prisma.articleLike.delete({
        where: {
          articleSlug_viewerId: {
            articleSlug,
            viewerId,
          },
        },
      })
    } else {
      await prisma.articleLike.create({
        data: {
          articleSlug,
          viewerId,
        },
      })
    }

    const likes = await prisma.articleLike.count({
      where: { articleSlug },
    })

    return {
      likes,
      likedByViewer: !existing,
    }
  } catch {
    return {
      likes: 0,
      likedByViewer: false,
    }
  }
}

export async function listComments(articleSlug: string): Promise<PublicComment[]> {
  if (!isBehaviorStorageEnabled()) {
    return [] as PublicComment[]
  }

  try {
    const comments: PublicCommentRecord[] = await prisma.comment.findMany({
      where: {
        articleSlug,
        status: APPROVED_COMMENT_STATUS,
      },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        authorName: true,
        content: true,
        createdAt: true,
        parentId: true,
        parent: {
          select: {
            id: true,
            authorName: true,
          },
        },
      },
    })

    return buildCommentTree(comments)
  } catch {
    return [] as PublicComment[]
  }
}

export async function createComment(
  articleSlug: string,
  input: {
    userId: string
    authorName: string
    content: string
    parentId?: string | null
  }
): Promise<PublicComment> {
  const userId = input.userId.trim()
  const authorName = input.authorName.trim().slice(0, 40)
  const content = input.content.trim().slice(0, 2000)
  const parentId = input.parentId?.trim() || null

  if (!userId || !authorName || !content) {
    throw new Error("INVALID_COMMENT")
  }

  if (!isBehaviorStorageEnabled()) {
    throw new Error("DATABASE_NOT_CONFIGURED")
  }

  if (parentId) {
    const parent = await prisma.comment.findUnique({
      where: { id: parentId },
      select: {
        id: true,
        articleSlug: true,
        status: true,
      },
    })

    if (!parent || parent.articleSlug !== articleSlug || parent.status !== APPROVED_COMMENT_STATUS) {
      throw new Error("INVALID_REPLY_TARGET")
    }
  }

  const comment: CreatedCommentRecord = await prisma.comment.create({
    data: {
      articleSlug,
      userId,
      authorName,
      content,
      parentId,
    },
    select: {
      id: true,
      authorName: true,
      content: true,
      createdAt: true,
      parentId: true,
      parent: {
        select: {
          authorName: true,
        },
      },
    },
  })

  return toPublicComment(comment)
}

function buildCommentTree(records: PublicCommentRecord[]): PublicComment[] {
  const nodes = new Map<string, PublicComment>()

  for (const record of records) {
    nodes.set(record.id, toPublicComment(record))
  }

  const roots: PublicComment[] = []

  for (const record of records) {
    const node = nodes.get(record.id)

    if (!node) {
      continue
    }

    if (record.parentId) {
      const parent = nodes.get(record.parentId)

      if (parent) {
        parent.replies.push(node)
        continue
      }
    }

    roots.push(node)
  }

  return roots.sort(
    (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
  )
}

function toPublicComment(record: PublicCommentRecord | CreatedCommentRecord): PublicComment {
  return {
    id: record.id,
    authorName: record.authorName,
    content: record.content,
    createdAt: record.createdAt.toISOString(),
    parentId: record.parentId,
    replyToAuthorName: record.parent?.authorName ?? null,
    replies: [],
  }
}

function emptySnapshot(): EngagementSnapshot {
  return {
    views: 0,
    likes: 0,
    commentsCount: 0,
    likedByViewer: false,
  }
}
