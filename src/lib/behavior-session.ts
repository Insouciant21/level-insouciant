import { randomUUID } from "node:crypto"

import type { NextResponse } from "next/server"
import { cookies } from "next/headers"

import { BEHAVIOR_VISITOR_COOKIE } from "@/lib/behavior"

export async function getOrCreateBehaviorViewerId() {
  const cookieStore = await cookies()
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
  response: NextResponse,
  input: {
    viewerId: string
    shouldSet: boolean
  }
) {
  if (!input.shouldSet) {
    return response
  }

  response.cookies.set(BEHAVIOR_VISITOR_COOKIE, input.viewerId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  })

  return response
}
