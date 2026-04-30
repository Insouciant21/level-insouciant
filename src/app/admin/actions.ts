"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { COMMENT_STATUS, deleteCommentForAdmin, setCommentStatus } from "@/lib/admin"
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

function redirectWithQuery(path: string, params: Record<string, string>) {
  const searchParams = new URLSearchParams(params)

  redirect(`${path}?${searchParams.toString()}`)
}

function redirectWithError(path: string, error: string) {
  redirectWithQuery(path, { error })
}

function redirectWithNotice(path: string, notice: string) {
  redirectWithQuery(path, { notice })
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
  redirectWithQuery(`/admin/articles/${article.slug}/edit`, {
    created: "1",
    notice: article.draft ? "article-draft-created" : "article-created",
  })
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
  redirectWithQuery(`/admin/articles/${slug}/edit`, {
    saved: "1",
    notice: payload.draft ? "article-draft-saved" : "article-published",
  })
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
  redirectWithQuery(`/admin/articles/${slug}/history`, {
    restored: "1",
    notice: "revision-restored",
  })
}

export async function publishArticleAction(formData: FormData) {
  const admin = await requireAdmin()
  const slug = getString(formData, "slug")

  try {
    await setArticleDraftState(slug, false, admin.id)
  } catch (error) {
    if (error instanceof Error) {
      redirectWithError("/admin/articles", error.message)
    }

    throw error
  }

  revalidatePublicContent(slug)
  revalidateAdminContent(slug)
  redirectWithNotice("/admin/articles", "article-published")
}

export async function hideArticleAction(formData: FormData) {
  const admin = await requireAdmin()
  const slug = getString(formData, "slug")

  try {
    await setArticleDraftState(slug, true, admin.id)
  } catch (error) {
    if (error instanceof Error) {
      redirectWithError("/admin/articles", error.message)
    }

    throw error
  }

  revalidatePublicContent(slug)
  revalidateAdminContent(slug)
  redirectWithNotice("/admin/articles", "article-hidden")
}

export async function deleteArticleAction(formData: FormData) {
  await requireAdmin()
  const slug = getString(formData, "slug")

  try {
    await deleteArticleBySlug(slug)
  } catch (error) {
    if (error instanceof Error) {
      redirectWithError("/admin/articles", error.message)
    }

    throw error
  }

  revalidatePublicContent(slug)
  revalidateAdminContent()
  redirectWithNotice("/admin/articles", "article-deleted")
}

export async function hideCommentAction(formData: FormData) {
  await requireAdmin()
  const commentId = getString(formData, "commentId")
  const slug = getString(formData, "slug")

  try {
    await setCommentStatus(commentId, COMMENT_STATUS.HIDDEN)
  } catch (error) {
    if (error instanceof Error) {
      redirectWithError("/admin/comments", error.message)
    }

    throw error
  }

  revalidatePublicContent(slug)
  revalidatePath("/admin")
  revalidatePath("/admin/comments")
  revalidatePath("/admin/stats")
  redirectWithNotice("/admin/comments", "comment-hidden")
}

export async function approveCommentAction(formData: FormData) {
  await requireAdmin()
  const commentId = getString(formData, "commentId")
  const slug = getString(formData, "slug")

  try {
    await setCommentStatus(commentId, COMMENT_STATUS.APPROVED)
  } catch (error) {
    if (error instanceof Error) {
      redirectWithError("/admin/comments", error.message)
    }

    throw error
  }

  revalidatePublicContent(slug)
  revalidatePath("/admin")
  revalidatePath("/admin/comments")
  revalidatePath("/admin/stats")
  redirectWithNotice("/admin/comments", "comment-approved")
}

export async function deleteCommentAction(formData: FormData) {
  await requireAdmin()
  const commentId = getString(formData, "commentId")
  const slug = getString(formData, "slug")

  try {
    await deleteCommentForAdmin(commentId)
  } catch (error) {
    if (error instanceof Error) {
      redirectWithError("/admin/comments", error.message)
    }

    throw error
  }

  revalidatePublicContent(slug)
  revalidatePath("/admin")
  revalidatePath("/admin/comments")
  revalidatePath("/admin/stats")
  redirectWithNotice("/admin/comments", "comment-deleted")
}

export async function renameTagAction(formData: FormData) {
  const admin = await requireAdmin()
  const sourceTag = getString(formData, "sourceTag")
  const targetTag = getString(formData, "targetTag")

  try {
    await renameTagAcrossArticles(sourceTag, targetTag, admin.id)
  } catch (error) {
    if (error instanceof Error) {
      redirectWithError("/admin/tags", error.message)
    }

    throw error
  }

  revalidatePublicContent()
  revalidateAdminContent()
  redirectWithNotice("/admin/tags", "tag-renamed")
}

export async function removeTagAction(formData: FormData) {
  const admin = await requireAdmin()
  const sourceTag = getString(formData, "sourceTag")

  try {
    await removeTagAcrossArticles(sourceTag, admin.id)
  } catch (error) {
    if (error instanceof Error) {
      redirectWithError("/admin/tags", error.message)
    }

    throw error
  }

  revalidatePublicContent()
  revalidateAdminContent()
  redirectWithNotice("/admin/tags", "tag-removed")
}
