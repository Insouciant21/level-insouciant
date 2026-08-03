import type { Metadata } from "next"
import type { ReactNode } from "react"

import { AdminShell } from "@/components/admin/admin-shell"
import { getUserDisplayName, requireAdmin } from "@/lib/auth"
import { createPageMetadata } from "@/lib/seo"
import { getSiteConfig } from "@/lib/site-config"

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
  const siteConfig = await getSiteConfig()

  return (
    <AdminShell userName={getUserDisplayName(admin)} siteName={siteConfig.name}>
      {children}
    </AdminShell>
  )
}
