import { notFound } from "@/server/request-context"
import type { Metadata } from "@/types/seo"
import { getAccountProfile, getOwnComments } from "@/lib/account"
import { type AccountPageSearchParams } from "@/lib/account-page"
import { requireAdmin } from "@/lib/auth"
import { createPageMetadata } from "@/lib/seo"
import { getSiteConfig } from "@/lib/site-config"
type AdminAccountPageProps = {
  searchParams: Promise<AccountPageSearchParams>
}
export async function load({ searchParams }: AdminAccountPageProps) {
  const admin = await requireAdmin()
  const [profile, comments, params] = await Promise.all([
    getAccountProfile(admin.id),
    getOwnComments(admin.id),
    searchParams,
  ])

  if (!profile) {
    notFound()
  }

  return { profile, comments, params }
}
export async function generateMetadata(): Promise<Metadata> {
  const siteConfig = await getSiteConfig()

  return createPageMetadata(
    {
      title: "后台资料",
      description: "管理员资料与安全设置。",
      path: "/admin/account",
      noIndex: true,
    },
    siteConfig
  )
}
