"use server"

import { CommentStatus } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { deleteCommentForAdmin, setCommentStatus } from "@/lib/admin"
import { requireAdmin } from "@/lib/auth"
import {
  createManagedArticle,
  deleteArticleBySlug,
  removeTagAcrossArticles,
  restoreArticleRevision,
  renameTagAcrossArticles,
  setArticleDraftState,
  updateManagedArticle,
} from "@/lib/content-admin"

function getString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim()
}

function getTags(formData: FormData, key: string) {
  return getString(formData, key)
    .split(/[,\n]/)
    .map((tag) => tag.trim())
    .filter(Boolean)
}

function getDraftValue(formData: FormData) {
  return getString(formData, "intent") !== "publish"
}

function getArticlePayload(formData: FormData) {
  return {
    slug: getString(formData, "slug"),
    title: getString(formData, "title"),
    desc: getString(formData, "desc"),
    category: getString(formData, "category"),
    tags: getTags(formData, "tags"),
    cover: getString(formData, "cover"),
    publishedAt: getString(formData, "publishedAt"),
    content: getString(formData, "content"),
    draft: getDraftValue(formData),
  }
}

function revalidatePublicContent(slug?: string) {
  revalidatePath("/")
  revalidatePath("/articles")
  revalidatePath("/tags")
  revalidatePath("/categories")
  revalidatePath("/search")

  if (slug) {
    revalidatePath(`/articles/${slug}`)
  }
}

function revalidateAdminContent(slug?: string) {
  revalidatePath("/admin")
  revalidatePath("/admin/articles")
  revalidatePath("/admin/tags")
  revalidatePath("/admin/stats")

  if (slug) {
    revalidatePath(`/admin/articles/${slug}/edit`)
    revalidatePath(`/admin/articles/${slug}/history`)
  }
}

function redirectWithError(path: string, error: string) {
  redirect(`${path}?error=${encodeURIComponent(error)}`)
}

export async function createArticleAction(formData: FormData) {
  const admin = await requireAdmin()
  const payload = getArticlePayload(formData)
  let article

  try {
    article = await createManagedArticle(payload, admin.id)
  } catch (error) {
    if (error instanceof Error) {
      redirectWithError("/admin/articles/new", error.message)
    }

    throw error
  }

  revalidatePublicContent(article.slug)
  revalidateAdminContent(article.slug)
  redirect(`/admin/articles/${article.slug}/edit?created=1`)
}

export async function updateArticleAction(formData: FormData) {
  const admin = await requireAdmin()
  const slug = getString(formData, "slug")
  const payload = getArticlePayload(formData)

  try {
    await updateManagedArticle(slug, payload, admin.id)
  } catch (error) {
    if (error instanceof Error) {
      redirectWithError(`/admin/articles/${slug}/edit`, error.message)
    }

    throw error
  }

  revalidatePublicContent(slug)
  revalidateAdminContent(slug)
  redirect(`/admin/articles/${slug}/edit?saved=1`)
}

export async function restoreArticleRevisionAction(formData: FormData) {
  const admin = await requireAdmin()
  const slug = getString(formData, "slug")
  const revisionId = getString(formData, "revisionId")

  try {
    await restoreArticleRevision(slug, revisionId, admin.id)
  } catch (error) {
    if (error instanceof Error) {
      redirectWithError(`/admin/articles/${slug}/history`, error.message)
    }

    throw error
  }

  revalidatePublicContent(slug)
  revalidateAdminContent(slug)
  redirect(`/admin/articles/${slug}/history?restored=1`)
}

export async function publishArticleAction(formData: FormData) {
  const admin = await requireAdmin()
  const slug = getString(formData, "slug")
  await setArticleDraftState(slug, false, admin.id)
  revalidatePublicContent(slug)
  revalidateAdminContent(slug)
}

export async function hideArticleAction(formData: FormData) {
  const admin = await requireAdmin()
  const slug = getString(formData, "slug")
  await setArticleDraftState(slug, true, admin.id)
  revalidatePublicContent(slug)
  revalidateAdminContent(slug)
}

export async function deleteArticleAction(formData: FormData) {
  await requireAdmin()
  const slug = getString(formData, "slug")
  await deleteArticleBySlug(slug)
  revalidatePublicContent(slug)
  revalidateAdminContent()
}

export async function hideCommentAction(formData: FormData) {
  await requireAdmin()
  const commentId = getString(formData, "commentId")
  const slug = getString(formData, "slug")
  await setCommentStatus(commentId, CommentStatus.HIDDEN)
  revalidatePublicContent(slug)
  revalidatePath("/admin")
  revalidatePath("/admin/comments")
  revalidatePath("/admin/stats")
}

export async function approveCommentAction(formData: FormData) {
  await requireAdmin()
  const commentId = getString(formData, "commentId")
  const slug = getString(formData, "slug")
  await setCommentStatus(commentId, CommentStatus.APPROVED)
  revalidatePublicContent(slug)
  revalidatePath("/admin")
  revalidatePath("/admin/comments")
  revalidatePath("/admin/stats")
}

export async function deleteCommentAction(formData: FormData) {
  await requireAdmin()
  const commentId = getString(formData, "commentId")
  const slug = getString(formData, "slug")
  await deleteCommentForAdmin(commentId)
  revalidatePublicContent(slug)
  revalidatePath("/admin")
  revalidatePath("/admin/comments")
  revalidatePath("/admin/stats")
}

export async function renameTagAction(formData: FormData) {
  const admin = await requireAdmin()
  const sourceTag = getString(formData, "sourceTag")
  const targetTag = getString(formData, "targetTag")
  await renameTagAcrossArticles(sourceTag, targetTag, admin.id)
  revalidatePublicContent()
  revalidateAdminContent()
}

export async function removeTagAction(formData: FormData) {
  const admin = await requireAdmin()
  const sourceTag = getString(formData, "sourceTag")
  await removeTagAcrossArticles(sourceTag, admin.id)
  revalidatePublicContent()
  revalidateAdminContent()
}
