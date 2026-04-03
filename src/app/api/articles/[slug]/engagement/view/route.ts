import { NextResponse } from "next/server"

import { attachBehaviorViewerCookie, getOrCreateBehaviorViewerId } from "@/lib/behavior-session"
import { getArticleBySlug } from "@/lib/content"
import { recordPageView } from "@/lib/behavior"

type RouteProps = {
  params: Promise<{
    slug: string
  }>
}

export async function POST(_request: Request, { params }: RouteProps) {
  const { slug } = await params
  const article = await getArticleBySlug(slug)

  if (!article) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 })
  }

  const { viewerId, isNew } = await getOrCreateBehaviorViewerId()
  const result = await recordPageView(slug, viewerId)
  const response = NextResponse.json(result)

  return attachBehaviorViewerCookie(response, {
    viewerId,
    shouldSet: isNew,
  })
}
