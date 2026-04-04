import { PrismaPg } from "@prisma/adapter-pg"
import { Prisma, PrismaClient } from "@prisma/client"
import { Pool } from "pg"

declare global {
  var __insousPrisma__: PrismaClient | undefined
  var __insousPgPool__: Pool | undefined
  var __insousPrismaSignature__: string | undefined
}

const prismaClientSignature = Prisma.dmmf.datamodel.models
  .map((model) => `${model.name}:${model.fields.map((field) => field.name).join(",")}`)
  .join("|")

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

function getPrismaClient() {
  const hasMatchingSignature = globalThis.__insousPrismaSignature__ === prismaClientSignature

  if (!hasMatchingSignature) {
    void globalThis.__insousPrisma__?.$disconnect()
    void globalThis.__insousPgPool__?.end()
    globalThis.__insousPrisma__ = undefined
    globalThis.__insousPgPool__ = undefined
  }

  const client = globalThis.__insousPrisma__ ?? createPrismaClient()

  if (process.env.NODE_ENV !== "production") {
    globalThis.__insousPrisma__ = client
    globalThis.__insousPrismaSignature__ = prismaClientSignature
  }

  return client
}

export const prisma = getPrismaClient()

if (process.env.NODE_ENV !== "production") {
  globalThis.__insousPrisma__ = prisma
  globalThis.__insousPrismaSignature__ = prismaClientSignature
}
