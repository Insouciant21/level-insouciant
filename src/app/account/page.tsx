import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { UserAccountView } from "@/components/account/account-view"
import { getAccountProfile, getOwnComments } from "@/lib/account"
import { getAccountNotice, type AccountPageSearchParams } from "@/lib/account-page"
import { requireUser } from "@/lib/auth"
import { createPageMetadata } from "@/lib/seo"

type AccountPageProps = {
  searchParams: Promise<AccountPageSearchParams>
}

export const metadata: Metadata = createPageMetadata({
  title: "我的资料",
  description: "管理个人资料、密码和评论。",
  path: "/account",
  noIndex: true,
})

export default async function AccountPage({ searchParams }: AccountPageProps) {
  const user = await requireUser()

  if (user.role === "ADMIN") {
    redirect("/admin/account")
  }

  const [profile, comments, params] = await Promise.all([
    getAccountProfile(user.id),
    getOwnComments(user.id),
    searchParams,
  ])

  if (!profile) {
    return null
  }

  return (
    <UserAccountView
      profile={profile}
      comments={comments}
      notice={getAccountNotice(params)}
    />
  )
}
