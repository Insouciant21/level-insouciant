"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import {
  changeOwnPassword,
  deleteOwnComment,
  updateOwnProfile,
} from "@/lib/account"
import { requireUser } from "@/lib/auth"

function getString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim()
}

function redirectWithError(error: string) {
  redirect(`/account?error=${encodeURIComponent(error)}`)
}

export async function updateProfileAction(formData: FormData) {
  const user = await requireUser()

  try {
    await updateOwnProfile(user.id, {
      name: getString(formData, "name"),
      email: getString(formData, "email"),
      avatarUrl: getString(formData, "avatarUrl"),
    })
  } catch (error) {
    if (error instanceof Error) {
      redirectWithError(error.message)
    }

    throw error
  }

  revalidatePath("/")
  revalidatePath("/account")
  revalidatePath("/admin/dashboard")
  redirect("/account?profile=1")
}

export async function changePasswordAction(formData: FormData) {
  const user = await requireUser()

  try {
    await changeOwnPassword(user.id, {
      currentPassword: getString(formData, "currentPassword"),
      nextPassword: getString(formData, "nextPassword"),
      confirmPassword: getString(formData, "confirmPassword"),
    })
  } catch (error) {
    if (error instanceof Error) {
      redirectWithError(error.message)
    }

    throw error
  }

  revalidatePath("/account")
  redirect("/account?password=1")
}

export async function deleteOwnCommentAction(formData: FormData) {
  const user = await requireUser()
  const commentId = getString(formData, "commentId")

  try {
    const result = await deleteOwnComment(user.id, commentId)
    revalidatePath("/account")
    revalidatePath(`/articles/${result.articleSlug}`)
    revalidatePath("/admin/comments")
    revalidatePath("/admin/stats")
  } catch (error) {
    if (error instanceof Error) {
      redirectWithError(error.message)
    }

    throw error
  }

  redirect("/account?comment=1")
}
