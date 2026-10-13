import type { Metadata } from "@/types/seo"
import { createPageMetadata } from "@/lib/seo"
import { getSiteConfig } from "@/lib/site-config"
type AdminLoginPageProps = {
  searchParams: Promise<{
    error?: string
  }>
}
const errorMessages: Record<string, string> = {
  DATABASE_NOT_CONFIGURED: "数据库尚未配置完成，暂时无法登录后台。",
  INVALID_CREDENTIALS: "邮箱或密码不正确。",
  NO_ACCESS: "当前账号没有后台权限。",
}
export async function load({ searchParams }: AdminLoginPageProps) {
  const [params, siteConfig] = await Promise.all([
    searchParams,
    getSiteConfig(),
  ])
  const error = params.error
    ? (errorMessages[params.error] ?? "登录失败，请稍后重试。")
    : null

  return { siteConfig, error }
}
export async function generateMetadata(): Promise<Metadata> {
  const siteConfig = await getSiteConfig()

  return createPageMetadata(
    {
      title: "后台登录",
      description: "管理员登录入口。",
      path: "/admin/login",
      noIndex: true,
    },
    siteConfig
  )
}
