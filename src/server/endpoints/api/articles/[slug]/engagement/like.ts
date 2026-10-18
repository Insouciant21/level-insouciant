import { getCurrentUser } from "@/lib/auth"
import { isArticlePublished } from "@/lib/content"
import { toggleLike } from "@/lib/behavior"

type RouteProps = {
  params: Promise<{
    slug: string
  }>
}

export async function POST(_request: Request, { params }: RouteProps) {
  const { slug } = await params
  if (!(await isArticlePublished(slug))) {
    return Response.json({ error: "NOT_FOUND" }, { status: 404 })
  }

  const user = await getCurrentUser()

  if (!user) {
    return Response.json({ error: "AUTH_REQUIRED" }, { status: 401 })
  }

  const result = await toggleLike(slug, user.id)
  return Response.json(result)
}
