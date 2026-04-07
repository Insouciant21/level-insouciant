import { redirect } from "next/navigation"

import { auth } from "@/auth"
import { getUserDisplayName as getCredentialsUserDisplayName } from "@/lib/auth-credentials"
import { prisma } from "@/lib/prisma"

export async function getCurrentUser() {
  const session = await auth()

  if (!session?.user?.id) {
    return null
  }

  if (!process.env.DATABASE_URL) {
    return session.user
  }

  const freshUser = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      id: true,
      email: true,
      name: true,
      avatarUrl: true,
      role: true,
    },
  })

  if (!freshUser) {
    return session.user
  }

  return {
    ...session.user,
    id: freshUser.id,
    email: freshUser.email,
    name: freshUser.name ?? freshUser.email,
    image: freshUser.avatarUrl,
    role: freshUser.role,
  }
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
  const user = await getCurrentUser()

  if (!user) {
    redirect("/admin/login")
  }

  if (user.role !== "ADMIN") {
    redirect("/account")
  }

  return user
}

export async function requireUser() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login?next=/account")
  }

  return user
}
