import { createHash, randomBytes } from "node:crypto"
import { z } from "zod"
import { prisma } from "@/lib/prisma"

export const tokenSettings = z.object({
  name: z.string().trim().min(1).max(80),
  access: z.enum(["READ", "DRAFT", "PUBLISH"]),
  days: z.coerce.number().int().min(1).max(365),
})

function digest(secret: string) {
  return createHash("sha256").update(secret).digest("hex")
}

export async function issueAgentToken(
  ownerId: string,
  settings: z.infer<typeof tokenSettings>
) {
  const secret = `li_${randomBytes(32).toString("base64url")}`
  await prisma.agentToken.create({
    data: {
      ownerId,
      name: settings.name,
      access: settings.access,
      digest: digest(secret),
      expiresAt: new Date(Date.now() + settings.days * 86_400_000),
    },
  })
  return secret
}

export async function authenticateAgent(request: Request) {
  const match = /^Bearer (li_[A-Za-z0-9_-]{43})$/i.exec(
    request.headers.get("authorization") ?? ""
  )
  if (!match) return null
  return prisma.agentToken.findFirst({
    where: {
      digest: digest(match[1]),
      revokedAt: null,
      expiresAt: { gt: new Date() },
      owner: { role: "ADMIN" },
    },
    select: { id: true, name: true, access: true, ownerId: true },
  })
}

export async function listAgentTokens(ownerId: string) {
  return prisma.agentToken.findMany({
    where: { ownerId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      access: true,
      createdAt: true,
      expiresAt: true,
      revokedAt: true,
    },
  })
}

export async function revokeAgentToken(ownerId: string, id: string) {
  const result = await prisma.agentToken.updateMany({
    where: { id, ownerId, revokedAt: null },
    data: { revokedAt: new Date() },
  })
  return result.count > 0
}
