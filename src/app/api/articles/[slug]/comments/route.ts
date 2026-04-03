import { NextResponse } from "next/server"

import { createComment, isBehaviorStorageEnabled, listComments } from "@/lib/behavior"
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

  const comments = await listComments(slug)
  return NextResponse.json({ comments })
}

export async function POST(request: Request, { params }: RouteProps) {
  const { slug } = await params
  const article = await getArticleBySlug(slug)

  if (!article) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 })
  }

  if (!isBehaviorStorageEnabled()) {
    return NextResponse.json({ error: "DATABASE_NOT_CONFIGURED" }, { status: 503 })
  }

  const body = (await request.json()) as {
    authorName?: string
    content?: string
  }

  try {
    const comment = await createComment(slug, {
      authorName: body.authorName ?? "",
      content: body.content ?? "",
    })

    return NextResponse.json({ comment }, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_COMMENT") {
      return NextResponse.json({ error: "INVALID_COMMENT" }, { status: 400 })
    }

    return NextResponse.json({ error: "FAILED_TO_CREATE_COMMENT" }, { status: 500 })
  }
}
