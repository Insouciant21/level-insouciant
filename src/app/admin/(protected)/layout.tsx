import type { Metadata } from "next"
import type { ReactNode } from "react"

import { AdminShell } from "@/components/admin/admin-shell"
import { requireAdmin } from "@/lib/auth"
import { createPageMetadata } from "@/lib/seo"

export const metadata: Metadata = createPageMetadata({
  title: "博客后台",
  description: "管理员控制台。",
  path: "/admin",
  noIndex: true,
})

export default async function ProtectedAdminLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  const admin = await requireAdmin()

  return <AdminShell userName={admin.name ?? admin.email}>{children}</AdminShell>
}
