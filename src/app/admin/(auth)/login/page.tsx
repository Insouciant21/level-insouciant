import type { Metadata } from "next"

import { adminLoginAction } from "@/app/actions/auth"
import { Button } from "@/components/ui/button"
import { createPageMetadata } from "@/lib/seo"

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

export const metadata: Metadata = createPageMetadata({
  title: "后台登录",
  description: "管理员登录入口。",
  path: "/admin/login",
  noIndex: true,
})

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  const params = await searchParams
  const error = params.error ? errorMessages[params.error] ?? "登录失败，请稍后重试。" : null

  return (
    <main className="admin-console flex min-h-svh flex-1 items-center justify-center bg-[#0e0e0e] px-5 py-16 sm:px-6 lg:px-8">
      <section className="terminal-panel grid w-full max-w-6xl gap-8 px-6 py-8 sm:px-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <div className="relative z-10 space-y-4">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.34em] text-[#ff6d61]">Admin Access</p>
          <h1 className="text-4xl font-semibold tracking-tight text-[#f2eadb] sm:text-5xl">
            登录后台控制台
          </h1>
          <p className="max-w-xl text-sm leading-8 text-[#9aa194] sm:text-base">
            这里只有管理员能进入。普通用户和游客都只能在前台浏览、点赞与评论，无法触碰归档控制台。
          </p>
          <div className="admin-surface-muted px-5 py-5 text-sm leading-7 text-[#9aa194]">
            <p className="admin-kicker-accent">Bootstrap</p>
            <p className="mt-3">
              首次登录时，如果数据库里还没有管理员账号，系统会根据 `.env` 里的 `ADMIN_EMAIL` 和
              `ADMIN_PASSWORD` 自动创建第一个管理员。
            </p>
          </div>
        </div>

        <form action={adminLoginAction} className="relative z-10 grid gap-4">
          <label className="grid gap-2">
            <span className="text-sm font-medium text-[#d5d0c2]">邮箱</span>
            <input
              type="email"
              name="email"
              required
              placeholder="admin@example.com"
              className="admin-input bg-[#080908] text-[#77d490] placeholder:text-[#77d490]/25"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-[#d5d0c2]">密码</span>
            <input
              type="password"
              name="password"
              required
              placeholder="输入管理员密码"
              className="admin-input bg-[#080908] text-[#77d490] placeholder:text-[#77d490]/25"
            />
          </label>

          {error ? <p className="text-sm text-[#ff8d82]">{error}</p> : null}

          <Button type="submit" className="justify-center">
            Authorize Access
          </Button>
        </form>
      </section>
    </main>
  )
}
