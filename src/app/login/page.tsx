import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"

import { userLoginAction } from "@/app/actions/auth"
import { Button } from "@/components/ui/button"
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
const authPanelClass =
  "public-summary-panel-document px-6 py-8 sm:px-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]"
const authNoteClass =
  "public-summary-card-muted border-dashed bg-[#aaa891]/28 px-5 py-5 shadow-[inset_0_1px_0_rgba(255,252,225,0.14),0_14px_28px_-28px_rgba(0,0,0,0.24)]"

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
    <main className="mx-auto flex w-full max-w-5xl flex-1 items-center px-5 py-16 sm:px-6 lg:px-8">
      <section className={`grid w-full gap-8 ${authPanelClass}`}>
        <div className="space-y-4">
          <p className="utility-kicker">Sign In</p>
          <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            登录后参与互动
          </h1>
          <p className="max-w-xl text-sm leading-8 text-muted-foreground sm:text-base">
            游客只能浏览文章、阅读评论和查看互动数据。登录后才可以点赞与评论。
          </p>
          <div className={authNoteClass}>
            <p className="utility-kicker">Permission</p>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              登录后会回到你原本访问的页面，评论与点赞入口会直接解锁。
            </p>
          </div>
        </div>

        <form action={userLoginAction} className="grid gap-4">
          <input type="hidden" name="redirectTo" value={next} />

          <label className="grid gap-2">
            <span className="text-sm font-medium">邮箱</span>
            <input
              type="email"
              name="email"
              required
              placeholder="you@example.com"
              className="field-input"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium">密码</span>
            <input
              type="password"
              name="password"
              required
              placeholder="输入你的密码"
              className="field-input"
            />
          </label>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <Button type="submit" className="justify-center">
            登录
          </Button>

          <div className="h-px bg-border/70" />

          <p className="text-sm text-muted-foreground">
            还没有账号？
            <Link
              href={`/register?next=${encodeURIComponent(next)}`}
              className="ml-2 text-[#8a4f34] underline underline-offset-4 transition hover:text-[#6f3f28]"
            >
              去注册
            </Link>
          </p>
        </form>
      </section>
    </main>
  )
}
