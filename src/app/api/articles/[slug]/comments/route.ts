import { NextResponse } from "next/server"
import { ZodError } from "zod"

import { getCurrentUser, getUserDisplayName } from "@/lib/auth"
import { createComment, isBehaviorStorageEnabled, listComments } from "@/lib/behavior"
import { getArticleBySlug } from "@/lib/content"
import { parseCommentRequestBody } from "@/lib/validation/form-data"

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

  const user = await getCurrentUser()

  if (!user) {
    return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 })
  }

  let body

  try {
    body = parseCommentRequestBody(await request.json())
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "INVALID_COMMENT" }, { status: 400 })
    }

    throw error
  }

  try {
    const comment = await createComment(slug, {
      userId: user.id,
      authorName: getUserDisplayName(user),
      content: body.content ?? "",
      parentId: body.parentId ?? null,
    })

    return NextResponse.json({ comment }, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_COMMENT") {
      return NextResponse.json({ error: "INVALID_COMMENT" }, { status: 400 })
    }

    if (error instanceof Error && error.message === "INVALID_REPLY_TARGET") {
      return NextResponse.json({ error: "INVALID_REPLY_TARGET" }, { status: 400 })
    }

    return NextResponse.json({ error: "FAILED_TO_CREATE_COMMENT" }, { status: 500 })
  }
}
