import { prisma } from "@/lib/prisma"

export const BEHAVIOR_VISITOR_COOKIE = "insous_behavior_id"

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
}

export function isBehaviorStorageEnabled() {
  return Boolean(process.env.DATABASE_URL)
}

export async function getEngagementSnapshot(articleSlug: string, viewerId?: string) {
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
          status: "APPROVED",
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

export async function recordPageView(articleSlug: string, viewerId: string) {
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

export async function toggleLike(articleSlug: string, viewerId: string) {
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

export async function listComments(articleSlug: string) {
  if (!isBehaviorStorageEnabled()) {
    return [] as PublicComment[]
  }

  try {
    const comments = await prisma.comment.findMany({
      where: {
        articleSlug,
        status: "APPROVED",
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        authorName: true,
        content: true,
        createdAt: true,
      },
    })

    return comments.map((comment) => ({
      ...comment,
      createdAt: comment.createdAt.toISOString(),
    }))
  } catch {
    return [] as PublicComment[]
  }
}

export async function createComment(
  articleSlug: string,
  input: {
    authorName: string
    content: string
  }
) {
  const authorName = input.authorName.trim().slice(0, 40)
  const content = input.content.trim().slice(0, 2000)

  if (!authorName || !content) {
    throw new Error("INVALID_COMMENT")
  }

  if (!isBehaviorStorageEnabled()) {
    throw new Error("DATABASE_NOT_CONFIGURED")
  }

  const comment = await prisma.comment.create({
    data: {
      articleSlug,
      authorName,
      content,
    },
    select: {
      id: true,
      authorName: true,
      content: true,
      createdAt: true,
    },
  })

  return {
    ...comment,
    createdAt: comment.createdAt.toISOString(),
  } satisfies PublicComment
}

function emptySnapshot(): EngagementSnapshot {
  return {
    views: 0,
    likes: 0,
    commentsCount: 0,
    likedByViewer: false,
  }
}
