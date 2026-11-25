import { getCurrentAdmin } from "@/lib/auth"
import {
  issueAgentToken,
  listAgentTokens,
  revokeAgentToken,
  tokenSettings,
} from "@/lib/agent-tokens"

export async function GET() {
  const admin = await getCurrentAdmin()
  if (!admin) return Response.json({ error: "AUTH_REQUIRED" }, { status: 401 })
  return Response.json(await listAgentTokens(admin.id))
}

export async function POST(request: Request) {
  const admin = await getCurrentAdmin()
  if (!admin) return Response.json({ error: "AUTH_REQUIRED" }, { status: 401 })

  const input = tokenSettings.safeParse(await request.json().catch(() => null))
  if (!input.success)
    return Response.json({ error: "INVALID_TOKEN_SETTINGS" }, { status: 400 })

  const token = await issueAgentToken(admin.id, input.data)
  return Response.json({ token }, { status: 201 })
}

export async function DELETE(request: Request) {
  const admin = await getCurrentAdmin()
  if (!admin) return Response.json({ error: "AUTH_REQUIRED" }, { status: 401 })

  const body = await request.json().catch(() => null)
  if (typeof body?.id !== "string")
    return Response.json({ error: "INVALID_TOKEN_ID" }, { status: 400 })
  const revoked = await revokeAgentToken(admin.id, body.id)
  return revoked
    ? Response.json({ ok: true })
    : Response.json({ error: "TOKEN_NOT_FOUND" }, { status: 404 })
}
