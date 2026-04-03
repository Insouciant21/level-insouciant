import { NextResponse } from "next/server"

import { getEngagementSnapshot } from "@/lib/behavior"
import { attachBehaviorViewerCookie, getOrCreateBehaviorViewerId } from "@/lib/behavior-session"
import { getArticleBySlug } from "@/lib/content"

type RouteProps = {
  params: Promise<{
    slug: string
  }>
}

export async function GET(_request: Request, { params }: RouteProps) {
  const { slug } = await params
  const article = await getArticleBySlug(slug)

  if (!article) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 })
  }

  const { viewerId, isNew } = await getOrCreateBehaviorViewerId()
  const snapshot = await getEngagementSnapshot(slug, viewerId)
  const response = NextResponse.json(snapshot)

  return attachBehaviorViewerCookie(response, {
    viewerId,
    shouldSet: isNew,
  })
}
