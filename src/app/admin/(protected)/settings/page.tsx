import type { Metadata } from "next"

import { SiteSettingsForm } from "@/components/admin/site-settings-form"
import { createPageMetadata } from "@/lib/seo"
import { getSiteConfig } from "@/lib/site-config"

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    title: "站点设置",
    description: "编辑站点身份、页面内容、联系方式与页脚链接。",
    path: "/admin/settings",
    noIndex: true,
  })
}

export default async function AdminSettingsPage() {
  const siteConfig = await getSiteConfig()

  return (
    <div className="grid gap-6">
      <header className="admin-surface p-4 sm:p-6 lg:p-7">
        <p className="admin-kicker-accent">Site Settings</p>
        <h1 className="admin-title mt-2">站点设置</h1>
      </header>
      <SiteSettingsForm siteConfig={siteConfig} />
    </div>
  )
}
