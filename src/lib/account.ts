import { prisma } from "@/lib/prisma"
import {
  getUserDisplayName,
  hashPassword,
  isAuthStorageEnabled,
  verifyPassword,
} from "@/lib/auth-credentials"
import {
  passwordChangeInputSchema,
  profileInputSchema,
} from "@/lib/validation/auth"

export type AccountProfile = {
  id: string
  email: string
  name: string | null
  avatarUrl: string | null
  role: "ADMIN" | "USER"
  createdAt: string
}

export type AccountCommentItem = {
  id: string
  articleSlug: string
  articleTitle: string | null
  content: string
  authorName: string
  status: "APPROVED" | "HIDDEN"
  createdAt: string
  parentId: string | null
  replyToAuthorName: string | null
  repliesCount: number
}

type AccountCommentRecord = {
  id: string
  articleSlug: string
  content: string
  authorName: string
  status: "APPROVED" | "HIDDEN"
  createdAt: Date
  parentId: string | null
  parent: {
    authorName: string
  } | null
  _count: {
    replies: number
  }
}

export async function getAccountProfile(userId: string) {
  if (!isAuthStorageEnabled()) {
    return null
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      avatarUrl: true,
      role: true,
      createdAt: true,
    },
  })

  if (!user) {
    return null
  }

  return {
    ...user,
    createdAt: user.createdAt.toISOString(),
  } satisfies AccountProfile
}

export async function updateOwnProfile(
  userId: string,
  input: {
    name: string
    email: string
    avatarUrl: string
  }
) {
  if (!isAuthStorageEnabled()) {
    throw new Error("DATABASE_NOT_CONFIGURED")
  }

  const profileResult = profileInputSchema.safeParse(input)

  if (!profileResult.success) {
    throw new Error("INVALID_PROFILE_INPUT")
  }

  const { name, email, avatarUrl } = profileResult.data

  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
  })

  if (!currentUser) {
    throw new Error("USER_NOT_FOUND")
  }

  if (currentUser.email !== email) {
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    })

    if (existingUser) {
      throw new Error("EMAIL_TAKEN")
    }
  }

  const nextDisplayName = getUserDisplayName({
    name: name || null,
    email,
  })

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: {
        name: name || null,
        email,
        avatarUrl: avatarUrl || null,
      },
    }),
    prisma.comment.updateMany({
      where: { userId },
      data: {
        authorName: nextDisplayName,
      },
    }),
  ])
}

export async function changeOwnPassword(
  userId: string,
  input: {
    currentPassword: string
    nextPassword: string
    confirmPassword: string
  }
) {
  if (!isAuthStorageEnabled()) {
    throw new Error("DATABASE_NOT_CONFIGURED")
  }

  const passwordResult = passwordChangeInputSchema.safeParse(input)

  if (!passwordResult.success) {
    const onlyConfirmationFailed = passwordResult.error.issues.every(
      (issue) => issue.path[0] === "confirmPassword"
    )

    throw new Error(
      onlyConfirmationFailed
        ? "PASSWORD_CONFIRM_MISMATCH"
        : "INVALID_PASSWORD_INPUT"
    )
  }

  const { currentPassword, nextPassword } = passwordResult.data

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      passwordHash: true,
    },
  })

  if (!user) {
    throw new Error("USER_NOT_FOUND")
  }

  if (!verifyPassword(currentPassword, user.passwordHash)) {
    throw new Error("INVALID_CURRENT_PASSWORD")
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      passwordHash: hashPassword(nextPassword),
    },
  })
}

export async function getOwnComments(userId: string) {
  if (!isAuthStorageEnabled()) {
    return [] as AccountCommentItem[]
  }

  const comments: AccountCommentRecord[] = await prisma.comment.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      articleSlug: true,
      content: true,
      authorName: true,
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

  const slugs = [...new Set(comments.map((comment) => comment.articleSlug))]
  const articles = slugs.length
    ? await prisma.article.findMany({
        where: {
          slug: {
            in: slugs,
          },
        },
        select: {
          slug: true,
          title: true,
        },
      })
    : []

  const titleMap = new Map(articles.map((article) => [article.slug, article.title]))

  return comments.map((comment) => ({
    id: comment.id,
    articleSlug: comment.articleSlug,
    articleTitle: titleMap.get(comment.articleSlug) ?? null,
    content: comment.content,
    authorName: comment.authorName,
    status: comment.status,
    createdAt: comment.createdAt.toISOString(),
    parentId: comment.parentId,
    replyToAuthorName: comment.parent?.authorName ?? null,
    repliesCount: comment._count.replies,
  })) satisfies AccountCommentItem[]
}

export async function deleteOwnComment(userId: string, commentId: string) {
  if (!isAuthStorageEnabled()) {
    throw new Error("DATABASE_NOT_CONFIGURED")
  }

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: {
      id: true,
      userId: true,
      articleSlug: true,
      _count: {
        select: {
          replies: true,
        },
      },
    },
  })

  if (!comment) {
    throw new Error("COMMENT_NOT_FOUND")
  }

  if (comment.userId !== userId) {
    throw new Error("FORBIDDEN")
  }

  if (comment._count.replies > 0) {
    throw new Error("COMMENT_HAS_REPLIES")
  }

  await prisma.comment.delete({
    where: { id: commentId },
  })

  return {
    articleSlug: comment.articleSlug,
  }
}
