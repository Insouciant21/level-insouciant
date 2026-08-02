import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"

import { userRegisterAction } from "@/app/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
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
const authPanelClass =
  "public-summary-panel-document px-6 py-8 sm:px-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]"

export const metadata: Metadata = createPageMetadata({
  title: "账号注册",
  description: "注册后即可点赞、评论并管理自己的资料。",
  path: "/register",
  noIndex: true,
})

export default async function RegisterPage({
  searchParams,
}: RegisterPageProps) {
  const [user, params] = await Promise.all([getCurrentUser(), searchParams])
  const next = params.next && params.next.startsWith("/") ? params.next : "/"

  if (user) {
    redirect(next)
  }

  const error = params.error
    ? (errorMessages[params.error] ?? "注册失败，请稍后再试。")
    : null

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 items-center px-5 py-16 sm:px-6 lg:px-8">
      <section className={`grid w-full gap-8 ${authPanelClass}`}>
        <div className="space-y-4">
          <p className="utility-kicker">Create Account</p>
          <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            注册账号
          </h1>
          <p className="max-w-xl text-sm leading-8 text-muted-foreground sm:text-base">
            输入用户名、邮箱和密码即可注册。注册成功后会自动登录，你就可以参与点赞、评论并管理自己的资料。
          </p>
        </div>

        <form action={userRegisterAction} className="grid gap-4">
          <input type="hidden" name="redirectTo" value={next} />

          <div className="grid gap-2">
            <Label htmlFor="register-name">用户名</Label>
            <Input
              id="register-name"
              type="text"
              name="name"
              required
              placeholder="例如：insouciant"
              className="field-input h-11 rounded-none"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="register-email">邮箱</Label>
            <Input
              id="register-email"
              type="email"
              name="email"
              required
              placeholder="you@example.com"
              className="field-input h-11 rounded-none"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="register-password">密码</Label>
            <Input
              id="register-password"
              type="password"
              name="password"
              required
              minLength={8}
              placeholder="至少 8 位字符"
              className="field-input h-11 rounded-none"
            />
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <Button type="submit" className="justify-center">
            注册并登录
          </Button>

          <Separator className="bg-border/70" />

          <p className="text-sm text-muted-foreground">
            已经有账号了？
            <Link
              href={`/login?next=${encodeURIComponent(next)}`}
              className="ml-2 text-[#8a4f34] underline underline-offset-4 transition hover:text-[#6f3f28]"
            >
              去登录
            </Link>
          </p>
        </form>
      </section>
    </main>
  )
}
