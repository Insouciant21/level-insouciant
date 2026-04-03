import { NextResponse } from "next/server"

import { getCurrentUser } from "@/lib/auth"
import { getArticleBySlug } from "@/lib/content"
import { toggleLike } from "@/lib/behavior"

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

  const user = await getCurrentUser()

  if (!user) {
    return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 })
  }

  const result = await toggleLike(slug, user.id)
  return NextResponse.json(result)
}
