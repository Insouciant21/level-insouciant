import type { Metadata } from "next"

import { AdminAccountView } from "@/components/account/account-view"
import { getAccountProfile, getOwnComments } from "@/lib/account"
import { getAccountNotice, type AccountPageSearchParams } from "@/lib/account-page"
import { requireAdmin } from "@/lib/auth"
import { createPageMetadata } from "@/lib/seo"

type AdminAccountPageProps = {
  searchParams: Promise<AccountPageSearchParams>
}

export const metadata: Metadata = createPageMetadata({
  title: "后台资料",
  description: "管理员资料与安全设置。",
  path: "/admin/account",
  noIndex: true,
})

export default async function AdminAccountPage({ searchParams }: AdminAccountPageProps) {
  const admin = await requireAdmin()
  const [profile, comments, params] = await Promise.all([
    getAccountProfile(admin.id),
    getOwnComments(admin.id),
    searchParams,
  ])

  if (!profile) {
    return null
  }

  return (
    <AdminAccountView
      profile={profile}
      comments={comments}
      notice={getAccountNotice(params)}
    />
  )
}
