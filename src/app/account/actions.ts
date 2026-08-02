"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { ZodError } from "zod"

import {
  changeOwnPassword,
  deleteOwnComment,
  updateOwnProfile,
} from "@/lib/account"
import { getAccountPath } from "@/lib/account-page"
import { requireUser } from "@/lib/auth"
import {
  parsePasswordChangeFormData,
  parseProfileFormData,
} from "@/lib/validation/form-data"

function getString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim()
}

function redirectWithError(accountPath: string, error: string) {
  redirect(`${accountPath}?error=${encodeURIComponent(error)}`)
}

export async function updateProfileAction(formData: FormData) {
  const user = await requireUser()
  const accountPath = getAccountPath(user.role)

  try {
    await updateOwnProfile(user.id, parseProfileFormData(formData))
  } catch (error) {
    if (error instanceof ZodError) {
      redirectWithError(accountPath, "INVALID_PROFILE_INPUT")
    }

    if (error instanceof Error) {
      redirectWithError(accountPath, error.message)
    }

    throw error
  }

  revalidatePath("/")
  revalidatePath("/account")
  revalidatePath("/admin/account")
  revalidatePath("/admin/dashboard")
  redirect(`${accountPath}?profile=1`)
}

export async function changePasswordAction(formData: FormData) {
  const user = await requireUser()
  const accountPath = getAccountPath(user.role)

  try {
    await changeOwnPassword(user.id, parsePasswordChangeFormData(formData))
  } catch (error) {
    if (error instanceof ZodError) {
      redirectWithError(accountPath, "INVALID_PASSWORD_INPUT")
    }

    if (error instanceof Error) {
      redirectWithError(accountPath, error.message)
    }

    throw error
  }

  revalidatePath("/account")
  revalidatePath("/admin/account")
  redirect(`${accountPath}?password=1`)
}

export async function deleteOwnCommentAction(formData: FormData) {
  const user = await requireUser()
  const accountPath = getAccountPath(user.role)
  const commentId = getString(formData, "commentId")

  try {
    const result = await deleteOwnComment(user.id, commentId)
    revalidatePath("/account")
    revalidatePath("/admin/account")
    revalidatePath(`/articles/${result.articleSlug}`)
    revalidatePath("/admin/comments")
    revalidatePath("/admin/stats")
  } catch (error) {
    if (error instanceof Error) {
      redirectWithError(accountPath, error.message)
    }

    throw error
  }

  redirect(`${accountPath}?comment=1`)
}
