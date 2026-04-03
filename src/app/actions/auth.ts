"use server"

import { AuthError } from "next-auth"
import { redirect } from "next/navigation"

import { signIn, signOut } from "@/auth"
import { isAuthStorageEnabled } from "@/lib/auth-credentials"

function getString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim()
}

function getRedirectTarget(formData: FormData, fallback: string) {
  const value = getString(formData, "redirectTo")

  if (!value || !value.startsWith("/")) {
    return fallback
  }

  return value
}

export async function userLoginAction(formData: FormData) {
  if (!isAuthStorageEnabled()) {
    redirect("/login?error=DATABASE_NOT_CONFIGURED")
  }

  const email = getString(formData, "email")
  const password = getString(formData, "password")
  const redirectTo = getRedirectTarget(formData, "/")

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo,
    })
  } catch (error) {
    if (error instanceof AuthError) {
      redirect(`/login?error=INVALID_CREDENTIALS&next=${encodeURIComponent(redirectTo)}`)
    }

    throw error
  }
}

export async function adminLoginAction(formData: FormData) {
  if (!isAuthStorageEnabled()) {
    redirect("/admin/login?error=DATABASE_NOT_CONFIGURED")
  }

  const email = getString(formData, "email")
  const password = getString(formData, "password")

  try {
    await signIn("admin-credentials", {
      email,
      password,
      redirectTo: "/admin",
    })
  } catch (error) {
    if (error instanceof AuthError) {
      redirect("/admin/login?error=INVALID_CREDENTIALS")
    }

    throw error
  }
}

export async function logoutAction(formData: FormData) {
  const redirectTo = getRedirectTarget(formData, "/")
  await signOut({
    redirectTo,
  })
}
