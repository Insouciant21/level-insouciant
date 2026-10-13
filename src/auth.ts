import type { UserRole } from "@prisma/client"
import { Auth, type AuthConfig } from "@auth/core"
import { CredentialsSignin } from "@auth/core/errors"
import {
  requestContext,
  redirect,
  safeRedirect,
} from "@/server/request-context"
import Credentials from "@auth/core/providers/credentials"

import {
  authorizePasswordUser,
  getUserDisplayName,
} from "@/lib/auth-credentials"

export const authConfig: AuthConfig = {
  basePath: "/api/auth",
  trustHost: true,
  cookies: {
    sessionToken: {
      name: "astro-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  secret: process.env.AUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const user = await authorizePasswordUser(
          String(credentials?.email ?? ""),
          String(credentials?.password ?? "")
        )

        if (!user) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: getUserDisplayName(user),
          image: user.avatarUrl,
          role: user.role,
        }
      },
    }),
    Credentials({
      id: "admin-credentials",
      name: "Admin Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const user = await authorizePasswordUser(
          String(credentials?.email ?? ""),
          String(credentials?.password ?? ""),
          { requireRole: "ADMIN" satisfies UserRole }
        )

        if (!user) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: getUserDisplayName(user),
          image: user.avatarUrl,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.name = user.name
        token.email = user.email
        token.image = user.image
      }

      return token
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? ""
        session.user.role = (token.role as UserRole | undefined) ?? "USER"
        session.user.name = token.name
        session.user.email = typeof token.email === "string" ? token.email : ""
        session.user.image =
          typeof token.image === "string" ? token.image : null
      }

      return session
    },
  },
}

export async function auth() {
  const { context, headers } = requestContext()
  const url = new URL("/api/auth/session", context.url)
  const response = await Auth(
    new Request(url, {
      headers: { cookie: context.request.headers.get("cookie") ?? "" },
    }),
    authConfig
  )
  for (const cookie of response.headers.getSetCookie())
    headers.append("set-cookie", cookie)
  if (!response.ok) return null
  return (await response.json()) as import("@auth/core/types").Session | null
}
async function submitAuth(action: string, fields: Record<string, string>) {
  const { context, headers } = requestContext()
  const originalCookie = context.request.headers.get("cookie") ?? ""
  const csrfResponse = await Auth(
    new Request(new URL("/api/auth/csrf", context.url), {
      headers: { cookie: originalCookie },
    }),
    authConfig
  )
  const { csrfToken } = (await csrfResponse.json()) as { csrfToken: string }
  const csrfCookies = csrfResponse.headers.getSetCookie()
  const cookie = [
    originalCookie,
    ...csrfCookies.map((value) => value.split(";")[0]),
  ]
    .filter(Boolean)
    .join("; ")
  const response = await Auth(
    new Request(new URL(`/api/auth/${action}`, context.url), {
      method: "POST",
      headers: { cookie, "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ ...fields, csrfToken }),
    }),
    authConfig
  )
  for (const value of [...csrfCookies, ...response.headers.getSetCookie()])
    headers.append("set-cookie", value)
  const location = response.headers.get("location")
  if (
    (!response.ok && !location) ||
    (location && new URL(location, context.url).searchParams.has("error"))
  )
    throw new CredentialsSignin()
  redirect(safeRedirect(fields.callbackUrl))
}
export async function signIn(
  provider: string,
  input: { email: string; password: string; redirectTo: string }
) {
  return submitAuth(`callback/${provider}`, {
    email: input.email,
    password: input.password,
    callbackUrl: safeRedirect(input.redirectTo),
  })
}
export async function signOut(input: { redirectTo: string }) {
  return submitAuth("signout", { callbackUrl: safeRedirect(input.redirectTo) })
}
