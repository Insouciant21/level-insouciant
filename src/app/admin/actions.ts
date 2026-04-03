"use server"

import { CommentStatus } from "@prisma/client"
import { revalidatePath } from "next/cache"

import { deleteCommentForAdmin, setCommentStatus } from "@/lib/admin"
import { requireAdmin } from "@/lib/auth"
import {
  deleteArticleBySlug,
  removeTagAcrossArticles,
  renameTagAcrossArticles,
  setArticleDraftState,
} from "@/lib/content-admin"

function getString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim()
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

export async function publishArticleAction(formData: FormData) {
  await requireAdmin()
  const slug = getString(formData, "slug")
  await setArticleDraftState(slug, false)
  revalidatePublicContent(slug)
  revalidatePath("/admin")
  revalidatePath("/admin/articles")
  revalidatePath("/admin/stats")
}

export async function hideArticleAction(formData: FormData) {
  await requireAdmin()
  const slug = getString(formData, "slug")
  await setArticleDraftState(slug, true)
  revalidatePublicContent(slug)
  revalidatePath("/admin")
  revalidatePath("/admin/articles")
  revalidatePath("/admin/stats")
}

export async function deleteArticleAction(formData: FormData) {
  await requireAdmin()
  const slug = getString(formData, "slug")
  await deleteArticleBySlug(slug)
  revalidatePublicContent(slug)
  revalidatePath("/admin")
  revalidatePath("/admin/articles")
  revalidatePath("/admin/tags")
  revalidatePath("/admin/stats")
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
  await requireAdmin()
  const sourceTag = getString(formData, "sourceTag")
  const targetTag = getString(formData, "targetTag")
  await renameTagAcrossArticles(sourceTag, targetTag)
  revalidatePublicContent()
  revalidatePath("/admin")
  revalidatePath("/admin/articles")
  revalidatePath("/admin/tags")
}

export async function removeTagAction(formData: FormData) {
  await requireAdmin()
  const sourceTag = getString(formData, "sourceTag")
  await removeTagAcrossArticles(sourceTag)
  revalidatePublicContent()
  revalidatePath("/admin")
  revalidatePath("/admin/articles")
  revalidatePath("/admin/tags")
}
