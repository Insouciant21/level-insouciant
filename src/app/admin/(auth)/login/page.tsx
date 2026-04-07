import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { adminLoginAction } from "@/app/actions/auth"
import { getCurrentUser } from "@/lib/auth"
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
  const [user, params] = await Promise.all([getCurrentUser(), searchParams])

  if (user?.role === "ADMIN") {
    redirect("/admin/dashboard")
  }

  if (user) {
    redirect("/account")
  }

  const error = params.error ? errorMessages[params.error] ?? "登录失败，请稍后重试。" : null

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 items-center px-5 py-16 sm:px-6">
      <section className="surface-panel w-full px-6 py-8 sm:px-8">
        <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Admin Access</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">登录后台</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
          只有管理员可以进入后台。普通用户和游客都只能在前台浏览、点赞与评论，无法进入内容管理区域。
        </p>

        <form action={adminLoginAction} className="mt-8 grid gap-4">
          <input type="hidden" name="redirectTo" value="/admin" />
          <label className="grid gap-2">
            <span className="text-sm font-medium">邮箱</span>
            <input
              type="email"
              name="email"
              required
              placeholder="admin@example.com"
              className="rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none transition focus:border-primary/50"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium">密码</span>
            <input
              type="password"
              name="password"
              required
              placeholder="输入管理员密码"
              className="rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none transition focus:border-primary/50"
            />
          </label>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            登录
          </button>
        </form>

        <div className="mt-8 rounded-3xl border border-dashed border-border/80 px-4 py-4 text-sm leading-7 text-muted-foreground">
          首次登录时，如果数据库里还没有管理员账号，系统会根据 `.env` 里的 `ADMIN_EMAIL` 和
          `ADMIN_PASSWORD` 自动创建第一个管理员。
        </div>
      </section>
    </main>
  )
}
