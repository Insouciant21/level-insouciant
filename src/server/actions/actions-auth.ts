import { AuthError } from "@auth/core/errors"
import { safeRedirect, redirect } from "@/server/request-context"
import { ZodError } from "zod"

import { signIn, signOut } from "@/auth"
import {
  isAuthStorageEnabled,
  registerPasswordUser,
} from "@/lib/auth-credentials"
import {
  parseLoginFormData,
  parseRegistrationFormData,
} from "@/lib/validation/form-data"

function getString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim()
}

function getRedirectTarget(formData: FormData, fallback: string) {
  const value = getString(formData, "redirectTo")

  if (!value || !value.startsWith("/")) {
    return fallback
  }

  return safeRedirect(value, fallback)
}

export async function userLoginAction(formData: FormData) {
  if (!isAuthStorageEnabled()) {
    redirect("/login?error=DATABASE_NOT_CONFIGURED")
  }

  const redirectTo = getRedirectTarget(formData, "/")
  let credentials

  try {
    credentials = parseLoginFormData(formData)
  } catch (error) {
    if (error instanceof ZodError) {
      redirect(
        `/login?error=INVALID_CREDENTIALS&next=${encodeURIComponent(redirectTo)}`
      )
    }

    throw error
  }

  try {
    await signIn("credentials", {
      email: credentials.email,
      password: credentials.password,
      redirectTo,
    })
  } catch (error) {
    if (error instanceof AuthError) {
      redirect(
        `/login?error=INVALID_CREDENTIALS&next=${encodeURIComponent(redirectTo)}`
      )
    }

    throw error
  }
}

export async function adminLoginAction(formData: FormData) {
  if (!isAuthStorageEnabled()) {
    redirect("/admin/login?error=DATABASE_NOT_CONFIGURED")
  }

  let credentials

  try {
    credentials = parseLoginFormData(formData)
  } catch (error) {
    if (error instanceof ZodError) {
      redirect("/admin/login?error=INVALID_CREDENTIALS")
    }

    throw error
  }

  try {
    await signIn("admin-credentials", {
      email: credentials.email,
      password: credentials.password,
      redirectTo: "/admin/dashboard",
    })
  } catch (error) {
    if (error instanceof AuthError) {
      redirect("/admin/login?error=INVALID_CREDENTIALS")
    }

    throw error
  }
}

export async function userRegisterAction(formData: FormData) {
  if (!isAuthStorageEnabled()) {
    redirect("/register?error=DATABASE_NOT_CONFIGURED")
  }

  const redirectTo = getRedirectTarget(formData, "/")
  let registration

  try {
    registration = parseRegistrationFormData(formData)
  } catch (error) {
    if (error instanceof ZodError) {
      redirect(
        `/register?error=INVALID_REGISTRATION_INPUT&next=${encodeURIComponent(redirectTo)}`
      )
    }

    throw error
  }

  try {
    await registerPasswordUser(registration)
  } catch (error) {
    if (error instanceof Error) {
      redirect(
        `/register?error=${encodeURIComponent(error.message)}&next=${encodeURIComponent(redirectTo)}`
      )
    }

    throw error
  }

  try {
    await signIn("credentials", {
      email: registration.email,
      password: registration.password,
      redirectTo,
    })
  } catch (error) {
    if (error instanceof AuthError) {
      redirect(
        `/login?error=INVALID_CREDENTIALS&next=${encodeURIComponent(redirectTo)}`
      )
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
