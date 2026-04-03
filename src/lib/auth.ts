import { redirect } from "next/navigation"

import { auth } from "@/auth"
import { getUserDisplayName as getCredentialsUserDisplayName } from "@/lib/auth-credentials"

export async function getCurrentUser() {
  const session = await auth()
  return session?.user ?? null
}

export function getUserDisplayName(user: { name?: string | null; email?: string | null }) {
  return getCredentialsUserDisplayName({
    name: user.name ?? null,
    email: user.email ?? "",
  })
}

export async function getCurrentAdmin() {
  const user = await getCurrentUser()
  return user?.role === "ADMIN" ? user : null
}

export async function requireAdmin() {
  const user = await getCurrentAdmin()

  if (!user) {
    redirect("/admin/login")
  }

  return user
}
