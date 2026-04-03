import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@prisma/client"
import { Pool } from "pg"

declare global {
  var __insousPrisma__: PrismaClient | undefined
  var __insousPgPool__: Pool | undefined
}

function createPool() {
  return new Pool({
    connectionString: process.env.DATABASE_URL,
  })
}

function getPool() {
  const pool = globalThis.__insousPgPool__ ?? createPool()

  if (process.env.NODE_ENV !== "production") {
    globalThis.__insousPgPool__ = pool
  }

  return pool
}

function createPrismaClient() {
  const adapter = new PrismaPg(getPool())
  return new PrismaClient({ adapter })
}

export const prisma = globalThis.__insousPrisma__ ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") {
  globalThis.__insousPrisma__ = prisma
}
