import type { Metadata } from "@/types/seo"
import { redirect, safeRedirect } from "@/server/request-context"
import { getCurrentUser } from "@/lib/auth"
import { createPageMetadata } from "@/lib/seo"
import { getSiteConfig } from "@/lib/site-config"
type LoginPageProps = {
  searchParams: Promise<{
    error?: string
    next?: string
  }>
}
const errorMessages: Record<string, string> = {
  DATABASE_NOT_CONFIGURED: "数据库尚未配置完成，暂时无法登录。",
  INVALID_CREDENTIALS: "邮箱或密码不正确。",
}
export async function load({ searchParams }: LoginPageProps) {
  const [user, params] = await Promise.all([getCurrentUser(), searchParams])
  const next = safeRedirect(params.next ?? "")

  if (user) {
    redirect(next)
  }

  const error = params.error
    ? (errorMessages[params.error] ?? "登录失败，请稍后再试。")
    : null

  return { next, error }
}
export async function generateMetadata(): Promise<Metadata> {
  const siteConfig = await getSiteConfig()

  return createPageMetadata(
    {
      title: "用户登录",
      description: "登录后即可点赞与评论。",
      path: "/login",
      noIndex: true,
    },
    siteConfig
  )
}
