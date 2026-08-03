import type { Metadata } from "next"
import type { ReactNode } from "react"

import { AdminShell } from "@/components/admin/admin-shell"
import { getUserDisplayName, requireAdmin } from "@/lib/auth"
import { getFaviconMetadata } from "@/lib/favicon-assets"
import { createPageMetadata } from "@/lib/seo"
import { getSiteConfig } from "@/lib/site-config"

export async function generateMetadata(): Promise<Metadata> {
  const siteConfig = await getSiteConfig()

  return createPageMetadata(
    {
      title: "博客后台",
      description: "管理员控制台。",
      path: "/admin",
      noIndex: true,
    },
    siteConfig
  )
}

export default async function ProtectedAdminLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  const admin = await requireAdmin()
  const [siteConfig, faviconMetadata] = await Promise.all([
    getSiteConfig(),
    getFaviconMetadata(),
  ])

  return (
    <AdminShell
      siteIconUrl={faviconMetadata.urls.icon32}
      userImage={admin.image}
      userName={getUserDisplayName(admin)}
      siteName={siteConfig.name}
    >
      {children}
    </AdminShell>
  )
}
