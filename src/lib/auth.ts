import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto"

import type { User } from "@prisma/client"
import { UserRole } from "@prisma/client"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { prisma } from "@/lib/prisma"

const AUTH_SESSION_COOKIE = "insous_auth_session"
const AUTH_SESSION_TTL_DAYS = 30

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

function hashSessionToken(token: string) {
  return createHash("sha256").update(token).digest("hex")
}

export function hashPassword(password: string, salt = randomBytes(16).toString("hex")) {
  const derivedKey = scryptSync(password, salt, 64)
  return `scrypt:${salt}:${derivedKey.toString("hex")}`
}

export function verifyPassword(password: string, storedHash: string) {
  const [algorithm, salt, key] = storedHash.split(":")

  if (algorithm !== "scrypt" || !salt || !key) {
    return false
  }

  const incomingKey = scryptSync(password, salt, 64)
  const storedKey = Buffer.from(key, "hex")

  if (incomingKey.length !== storedKey.length) {
    return false
  }

  return timingSafeEqual(incomingKey, storedKey)
}

function getBootstrapAdminConfig() {
  const email = normalizeEmail(process.env.ADMIN_EMAIL ?? "")
  const password = process.env.ADMIN_PASSWORD ?? ""

  if (!email || !password) {
    return null
  }

  return { email, password }
}

async function maybeBootstrapAdmin(email: string, password: string) {
  const config = getBootstrapAdminConfig()

  if (!config || normalizeEmail(email) !== config.email || password !== config.password) {
    return null
  }

  const existing = await prisma.user.findUnique({
    where: { email: config.email },
  })

  if (existing) {
    return existing
  }

  return prisma.user.create({
    data: {
      email: config.email,
      name: "Administrator",
      passwordHash: hashPassword(config.password),
      role: UserRole.ADMIN,
    },
  })
}

async function setSessionCookie(token: string, expiresAt: Date) {
  const cookieStore = await cookies()
  cookieStore.set(AUTH_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  })
}

export async function authenticateWithPassword(email: string, password: string) {
  if (!process.env.DATABASE_URL) {
    return {
      ok: false as const,
      reason: "DATABASE_NOT_CONFIGURED",
    }
  }

  const normalizedEmail = normalizeEmail(email)

  if (!normalizedEmail || !password.trim()) {
    return {
      ok: false as const,
      reason: "INVALID_CREDENTIALS",
    }
  }

  let user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  })

  if (!user) {
    user = await maybeBootstrapAdmin(normalizedEmail, password)
  }

  if (!user) {
    return {
      ok: false as const,
      reason: "INVALID_CREDENTIALS",
    }
  }

  if (!verifyPassword(password, user.passwordHash)) {
    return {
      ok: false as const,
      reason: "INVALID_CREDENTIALS",
    }
  }

  return {
    ok: true as const,
    user,
  }
}

export async function createSessionForUser(userId: string) {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_NOT_CONFIGURED")
  }

  const token = randomBytes(32).toString("hex")
  const expiresAt = new Date(Date.now() + AUTH_SESSION_TTL_DAYS * 24 * 60 * 60 * 1000)

  await prisma.session.create({
    data: {
      tokenHash: hashSessionToken(token),
      expiresAt,
      userId,
    },
  })

  await setSessionCookie(token, expiresAt)
}

export async function destroyCurrentSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get(AUTH_SESSION_COOKIE)?.value

  if (token && process.env.DATABASE_URL) {
    await prisma.session.deleteMany({
      where: {
        tokenHash: hashSessionToken(token),
      },
    })
  }

  cookieStore.delete(AUTH_SESSION_COOKIE)
}

async function getSessionUser(): Promise<User | null> {
  if (!process.env.DATABASE_URL) {
    return null
  }

  const cookieStore = await cookies()
  const token = cookieStore.get(AUTH_SESSION_COOKIE)?.value

  if (!token) {
    return null
  }

  const session = await prisma.session.findUnique({
    where: {
      tokenHash: hashSessionToken(token),
    },
    include: {
      user: true,
    },
  })

  if (!session) {
    return null
  }

  if (session.expiresAt <= new Date()) {
    await prisma.session.delete({
      where: {
        id: session.id,
      },
    })
    cookieStore.delete(AUTH_SESSION_COOKIE)
    return null
  }

  return session.user
}

export async function getCurrentUser() {
  return getSessionUser()
}

export async function getCurrentAdmin() {
  const user = await getSessionUser()
  return user?.role === UserRole.ADMIN ? user : null
}

export async function requireAdmin() {
  const user = await getCurrentAdmin()

  if (!user) {
    redirect("/admin/login")
  }

  return user
}
