import { notFound } from "@/server/request-context"
import type { Metadata } from "@/types/seo"
import { redirect } from "@/server/request-context"
import { getAccountProfile, getOwnComments } from "@/lib/account"
import { type AccountPageSearchParams } from "@/lib/account-page"
import { requireUser } from "@/lib/auth"
import { createPageMetadata } from "@/lib/seo"
import { getSiteConfig } from "@/lib/site-config"
type AccountPageProps = {
  searchParams: Promise<AccountPageSearchParams>
}
export async function load({ searchParams }: AccountPageProps) {
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
    notFound()
  }

  return { profile, comments, params }
}
export async function generateMetadata(): Promise<Metadata> {
  const siteConfig = await getSiteConfig()

  return createPageMetadata(
    {
      title: "我的资料",
      description: "管理个人资料、密码和评论。",
      path: "/account",
      noIndex: true,
    },
    siteConfig
  )
}
