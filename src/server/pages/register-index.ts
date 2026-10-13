import type { Metadata } from "@/types/seo"
import { redirect, safeRedirect } from "@/server/request-context"
import { getCurrentUser } from "@/lib/auth"
import { createPageMetadata } from "@/lib/seo"
import { getSiteConfig } from "@/lib/site-config"
type RegisterPageProps = {
  searchParams: Promise<{
    error?: string
    next?: string
  }>
}
const errorMessages: Record<string, string> = {
  DATABASE_NOT_CONFIGURED: "数据库尚未配置完成，暂时无法注册。",
  INVALID_REGISTRATION_INPUT: "请输入用户名、有效邮箱和至少 8 位密码。",
  EMAIL_TAKEN: "这个邮箱已经注册过了。",
  RESERVED_EMAIL: "这个邮箱已被保留，请使用其他邮箱注册。",
}
export async function load({ searchParams }: RegisterPageProps) {
  const [user, params] = await Promise.all([getCurrentUser(), searchParams])
  const next = safeRedirect(params.next ?? "")

  if (user) {
    redirect(next)
  }

  const error = params.error
    ? (errorMessages[params.error] ?? "注册失败，请稍后再试。")
    : null

  return { next, error }
}
export async function generateMetadata(): Promise<Metadata> {
  const siteConfig = await getSiteConfig()

  return createPageMetadata(
    {
      title: "账号注册",
      description: "注册后即可点赞、评论并管理自己的资料。",
      path: "/register",
      noIndex: true,
    },
    siteConfig
  )
}
