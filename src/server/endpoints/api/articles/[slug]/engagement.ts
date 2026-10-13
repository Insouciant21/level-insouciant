import { getEngagementSnapshot } from "@/lib/behavior"
import { getCurrentUser, getUserDisplayName } from "@/lib/auth"
import {
  attachBehaviorViewerCookie,
  getOrCreateBehaviorViewerId,
} from "@/lib/behavior-session"
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
    return Response.json({ error: "NOT_FOUND" }, { status: 404 })
  }

  const [user, session] = await Promise.all([
    getCurrentUser(),
    getOrCreateBehaviorViewerId(),
  ])
  const snapshot = await getEngagementSnapshot(slug, user?.id)
  const response = Response.json({
    ...snapshot,
    isAuthenticated: Boolean(user),
    currentUserName: user ? getUserDisplayName(user) : null,
  })

  return attachBehaviorViewerCookie(response, {
    viewerId: session.viewerId,
    shouldSet: session.isNew,
  })
}
