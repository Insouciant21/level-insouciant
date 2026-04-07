import { prisma } from "@/lib/prisma"
import {
  getUserDisplayName,
  hashPassword,
  isAuthStorageEnabled,
  normalizeEmail,
  verifyPassword,
} from "@/lib/auth-credentials"

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

  const name = input.name.trim().slice(0, 60)
  const email = normalizeEmail(input.email)
  const avatarUrl = input.avatarUrl.trim()

  if (!email) {
    throw new Error("INVALID_PROFILE_INPUT")
  }

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

  const currentPassword = input.currentPassword
  const nextPassword = input.nextPassword
  const confirmPassword = input.confirmPassword

  if (!currentPassword || !nextPassword || nextPassword.length < 8) {
    throw new Error("INVALID_PASSWORD_INPUT")
  }

  if (nextPassword !== confirmPassword) {
    throw new Error("PASSWORD_CONFIRM_MISMATCH")
  }

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

  const comments = await prisma.comment.findMany({
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
    ...comment,
    articleTitle: titleMap.get(comment.articleSlug) ?? null,
    createdAt: comment.createdAt.toISOString(),
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
    },
  })

  if (!comment) {
    throw new Error("COMMENT_NOT_FOUND")
  }

  if (comment.userId !== userId) {
    throw new Error("FORBIDDEN")
  }

  await prisma.comment.delete({
    where: { id: commentId },
  })

  return {
    articleSlug: comment.articleSlug,
  }
}
