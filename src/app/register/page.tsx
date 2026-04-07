import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"

import { userRegisterAction } from "@/app/actions/auth"
import { getCurrentUser } from "@/lib/auth"
import { createPageMetadata } from "@/lib/seo"

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

export const metadata: Metadata = createPageMetadata({
  title: "账号注册",
  description: "注册后即可点赞、评论并管理自己的资料。",
  path: "/register",
  noIndex: true,
})

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const [user, params] = await Promise.all([getCurrentUser(), searchParams])
  const next = params.next && params.next.startsWith("/") ? params.next : "/"

  if (user) {
    redirect(next)
  }

  const error = params.error ? errorMessages[params.error] ?? "注册失败，请稍后再试。" : null

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 items-center px-5 py-16 sm:px-6">
      <section className="surface-panel w-full px-6 py-8 sm:px-8">
        <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Create Account</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">注册账号</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
          输入用户名、邮箱和密码即可注册。注册成功后会自动登录，你就可以参与点赞、评论并管理自己的资料。
        </p>

        <form action={userRegisterAction} className="mt-8 grid gap-4">
          <input type="hidden" name="redirectTo" value={next} />

          <label className="grid gap-2">
            <span className="text-sm font-medium">用户名</span>
            <input
              type="text"
              name="name"
              required
              placeholder="例如：insouciant"
              className="rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none transition focus:border-primary/50"
            />
          </label>

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
              minLength={8}
              placeholder="至少 8 位字符"
              className="rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none transition focus:border-primary/50"
            />
          </label>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            注册并登录
          </button>
        </form>

        <p className="mt-6 text-sm text-muted-foreground">
          已经有账号了？
          <Link href={`/login?next=${encodeURIComponent(next)}`} className="ml-2 text-primary underline underline-offset-4">
            去登录
          </Link>
        </p>
      </section>
    </main>
  )
}
