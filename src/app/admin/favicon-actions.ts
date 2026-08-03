"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { requireAdmin } from "@/lib/auth"
import { saveFaviconUpload } from "@/lib/favicon-assets"

export async function uploadFaviconAction(formData: FormData) {
  await requireAdmin()

  const value = formData.get("favicon")

  if (!(value instanceof File)) {
    redirect("/admin/settings?error=INVALID_FAVICON_UPLOAD")
  }

  try {
    await saveFaviconUpload(value)
  } catch (error) {
    const errorKey =
      error instanceof Error && error.message === "INVALID_FAVICON_UPLOAD"
        ? "INVALID_FAVICON_UPLOAD"
        : "FAVICON_SAVE_FAILED"

    redirect(`/admin/settings?error=${errorKey}`)
  }

  revalidatePath("/", "layout")
  revalidatePath("/admin/settings")
  redirect("/admin/settings?notice=site-favicon-saved")
}
