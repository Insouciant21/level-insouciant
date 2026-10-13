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
    return Response.json({ error: "AUTH_REQUIRED" }, { status: 401 })
  }

  const { slug, revisionId } = await params
  const revision = await getArticleRevisionBody(slug, revisionId)

  if (!revision) {
    return Response.json({ error: "NOT_FOUND" }, { status: 404 })
  }

  return Response.json(revision)
}
