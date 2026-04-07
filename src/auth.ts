import type { UserRole } from "@prisma/client"
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"

import { authorizePasswordUser, getUserDisplayName } from "@/lib/auth-credentials"

export const { auth, handlers, signIn, signOut } = NextAuth({
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
        session.user.image = typeof token.image === "string" ? token.image : null
      }

      return session
    },
  },
})
