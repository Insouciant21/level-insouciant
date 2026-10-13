import type { UserRole } from "@prisma/client"
import type { DefaultSession } from "@auth/core/types"

declare module "@auth/core/types" {
  interface Session {
    user: {
      id: string
      role: UserRole
    } & DefaultSession["user"]
  }

  interface User {
    role: UserRole
    image?: string | null
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    role?: UserRole
    image?: string | null
  }
}
