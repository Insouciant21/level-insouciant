import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto"

import type { User } from "@prisma/client"
import { UserRole } from "@prisma/client"

import { prisma } from "@/lib/prisma"
import { registrationInputSchema } from "@/lib/validation/auth"

export function isAuthStorageEnabled() {
  return Boolean(process.env.DATABASE_URL)
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
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

export async function authorizePasswordUser(
  email: string,
  password: string,
  options?: {
    requireRole?: UserRole
  }
) {
  if (!isAuthStorageEnabled()) {
    return null
  }

  const normalizedEmail = normalizeEmail(email)

  if (!normalizedEmail || !password.trim()) {
    return null
  }

  let user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  })

  if (!user) {
    user = await maybeBootstrapAdmin(normalizedEmail, password)
  }

  if (!user || !verifyPassword(password, user.passwordHash)) {
    return null
  }

  if (options?.requireRole && user.role !== options.requireRole) {
    return null
  }

  return user satisfies User
}

export function getUserDisplayName(user: Pick<User, "name" | "email">) {
  return user.name?.trim() || user.email
}

export async function registerPasswordUser(input: {
  name: string
  email: string
  password: string
}) {
  if (!isAuthStorageEnabled()) {
    throw new Error("DATABASE_NOT_CONFIGURED")
  }

  const result = registrationInputSchema.safeParse(input)

  if (!result.success) {
    throw new Error("INVALID_REGISTRATION_INPUT")
  }

  const { name, email, password } = result.data
  const bootstrapAdmin = getBootstrapAdminConfig()

  if (bootstrapAdmin && email === bootstrapAdmin.email) {
    throw new Error("RESERVED_EMAIL")
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  })

  if (existingUser) {
    throw new Error("EMAIL_TAKEN")
  }

  return prisma.user.create({
    data: {
      name,
      email,
      passwordHash: hashPassword(password),
      role: UserRole.USER,
    },
  })
}
