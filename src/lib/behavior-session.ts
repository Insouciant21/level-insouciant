import { randomUUID } from "node:crypto"

import { requestContext } from "@/server/request-context"

import { BEHAVIOR_VISITOR_COOKIE } from "@/lib/behavior"

export async function getOrCreateBehaviorViewerId() {
  const cookieStore = requestContext().context.cookies
  const existing = cookieStore.get(BEHAVIOR_VISITOR_COOKIE)?.value

  if (existing) {
    return {
      viewerId: existing,
      isNew: false,
    }
  }

  return {
    viewerId: randomUUID(),
    isNew: true,
  }
}

export function attachBehaviorViewerCookie(
  response: Response,
  input: {
    viewerId: string
    shouldSet: boolean
  }
) {
  if (!input.shouldSet) {
    return response
  }

  requestContext().context.cookies.set(BEHAVIOR_VISITOR_COOKIE, input.viewerId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  })

  return response
}
