import { redirect } from "@/server/request-context"
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

  redirect(`${accountPath}?password=1`)
}

export async function deleteOwnCommentAction(formData: FormData) {
  const user = await requireUser()
  const accountPath = getAccountPath(user.role)
  const commentId = getString(formData, "commentId")

  try {
    await deleteOwnComment(user.id, commentId)
  } catch (error) {
    if (error instanceof Error) {
      redirectWithError(accountPath, error.message)
    }

    throw error
  }

  redirect(`${accountPath}?comment=1`)
}
