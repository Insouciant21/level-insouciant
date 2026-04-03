import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { userLoginAction } from "@/app/actions/auth"
import { getCurrentUser } from "@/lib/auth"
import { createPageMetadata } from "@/lib/seo"

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

export const metadata: Metadata = createPageMetadata({
  title: "用户登录",
  description: "登录后即可点赞与评论。",
  path: "/login",
  noIndex: true,
})

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const [user, params] = await Promise.all([getCurrentUser(), searchParams])
  const next = params.next && params.next.startsWith("/") ? params.next : "/"

  if (user) {
    redirect(next)
  }

  const error = params.error ? errorMessages[params.error] ?? "登录失败，请稍后再试。" : null

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 items-center px-5 py-16 sm:px-6">
      <section className="surface-panel w-full px-6 py-8 sm:px-8">
        <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Sign In</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">登录后参与互动</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
          游客只能浏览文章、阅读评论和查看互动数据。登录后的普通用户才可以点赞与评论，管理员则额外拥有后台权限。
        </p>

        <form action={userLoginAction} className="mt-8 grid gap-4">
          <input type="hidden" name="redirectTo" value={next} />

          <label className="grid gap-2">
            <span className="text-sm font-medium">邮箱</span>
            <input
              type="email"
              name="email"
              required
              placeholder="you@example.com"
              className="rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none transition focus:border-primary/50"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium">密码</span>
            <input
              type="password"
              name="password"
              required
              placeholder="输入你的密码"
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
      </section>
    </main>
  )
}
