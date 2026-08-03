"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { ZodError } from "zod"

import { requireAdmin } from "@/lib/auth"
import { saveSiteConfig } from "@/lib/site-config"
import { parseSiteSettingsFormData } from "@/lib/validation/form-data"

const knownStorageErrorKeys = new Set([
  "ARTICLE_NOT_FOUND",
  "ARTICLE_SLUG_TAKEN",
  "COMMENT_HAS_REPLIES",
  "COMMENT_NOT_FOUND",
  "DATABASE_NOT_CONFIGURED",
  "EMAIL_TAKEN",
  "FORBIDDEN",
  "INVALID_ARTICLE_INPUT",
  "INVALID_CREDENTIALS",
  "INVALID_CURRENT_PASSWORD",
  "INVALID_PASSWORD_INPUT",
  "INVALID_PROFILE_INPUT",
  "INVALID_TAG",
  "PASSWORD_CONFIRM_MISMATCH",
  "REVISION_NOT_FOUND",
  "USER_NOT_FOUND",
])

function getStorageErrorKey(error: unknown) {
  if (error instanceof Error && knownStorageErrorKeys.has(error.message)) {
    return error.message
  }

  return "SITE_SETTINGS_SAVE_FAILED"
}

export { parseSiteSettingsFormData }

export async function updateSiteSettingsAction(formData: FormData) {
  await requireAdmin()

  let data

  try {
    data = parseSiteSettingsFormData(formData)
  } catch (error) {
    if (error instanceof SyntaxError || error instanceof ZodError) {
      redirect("/admin/settings?error=INVALID_SITE_SETTINGS")
    }

    throw error
  }

  try {
    await saveSiteConfig(data)
  } catch (error) {
    redirect(`/admin/settings?error=${getStorageErrorKey(error)}`)
  }

  revalidatePath("/", "layout")
  revalidatePath("/admin/settings")
  revalidatePath("/sitemap.xml")
  revalidatePath("/robots.txt")
  revalidatePath("/rss.xml")
  revalidatePath("/opengraph-image")
  redirect("/admin/settings?notice=site-settings-saved")
}
