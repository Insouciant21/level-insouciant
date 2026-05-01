import { NextResponse } from "next/server"

import { getCurrentAdmin } from "@/lib/auth"
import { getArticleRevisionBody } from "@/lib/content-admin"

type RouteProps = {
  params: Promise<{
    slug: string
    revisionId: string
  }>
}

export async function GET(_request: Request, { params }: RouteProps) {
  const admin = await getCurrentAdmin()

  if (!admin) {
    return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 })
  }

  const { slug, revisionId } = await params
  const revision = await getArticleRevisionBody(slug, revisionId)

  if (!revision) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 })
  }

  return NextResponse.json(revision)
}
