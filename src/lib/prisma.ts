import { PrismaPg } from "@prisma/adapter-pg"
import { Prisma, PrismaClient } from "@prisma/client"
import { Pool } from "pg"

declare global {
  var __levelInsouciantPrisma__: PrismaClient | undefined
  var __levelInsouciantPgPool__: Pool | undefined
  var __levelInsouciantPrismaSignature__: string | undefined
}

const prismaClientSignature = [
  process.env.DATABASE_URL ?? "DATABASE_URL:missing",
  Prisma.dmmf.datamodel.models
    .map((model) => `${model.name}:${model.fields.map((field) => field.name).join(",")}`)
    .join("|"),
].join("|")

function createPool() {
  return new Pool({
    connectionString: process.env.DATABASE_URL,
  })
}

function getPool() {
  const pool = globalThis.__levelInsouciantPgPool__ ?? createPool()

  if (process.env.NODE_ENV !== "production") {
    globalThis.__levelInsouciantPgPool__ = pool
  }

  return pool
}

function createPrismaClient() {
  const adapter = new PrismaPg(getPool())
  return new PrismaClient({ adapter })
}

function getPrismaClient() {
  const hasMatchingSignature = globalThis.__levelInsouciantPrismaSignature__ === prismaClientSignature

  if (!hasMatchingSignature) {
    void globalThis.__levelInsouciantPrisma__?.$disconnect()
    void globalThis.__levelInsouciantPgPool__?.end()
    globalThis.__levelInsouciantPrisma__ = undefined
    globalThis.__levelInsouciantPgPool__ = undefined
  }

  const client = globalThis.__levelInsouciantPrisma__ ?? createPrismaClient()

  if (process.env.NODE_ENV !== "production") {
    globalThis.__levelInsouciantPrisma__ = client
    globalThis.__levelInsouciantPrismaSignature__ = prismaClientSignature
  }

  return client
}

export const prisma = getPrismaClient()

if (process.env.NODE_ENV !== "production") {
  globalThis.__levelInsouciantPrisma__ = prisma
  globalThis.__levelInsouciantPrismaSignature__ = prismaClientSignature
}
