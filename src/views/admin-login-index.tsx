import { ArrowRight, ShieldCheck } from "lucide-react"
import { adminLoginAction } from "@/lib/action-links"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

import type { load } from "@/server/pages/admin-login-index"
import { IslandProvider } from "@/components/providers/island-provider"
function View({ siteConfig, error }: Awaited<ReturnType<typeof load>>) {
  return (
    <main className="admin-console flex min-h-svh flex-1 items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
      <section className="admin-auth-panel grid w-full max-w-4xl overflow-hidden lg:grid-cols-[minmax(0,1.05fr)_minmax(20rem,0.95fr)]">
        <div className="flex flex-col justify-between gap-10 border-b border-white/10 px-6 py-8 sm:px-8 sm:py-10 lg:border-r lg:border-b-0 lg:px-10">
          <div className="space-y-6">
            <div className="flex size-11 items-center justify-center rounded-lg border border-[var(--safety-exit-green)]/35 bg-[var(--safety-exit-green)]/10 text-[var(--safety-exit-green)]">
              <ShieldCheck className="size-5" aria-hidden="true" />
            </div>
            <div className="space-y-3">
              <p className="admin-kicker-accent">Admin Access</p>
              <h1 className="text-3xl font-semibold tracking-tight text-[#edf3e9] sm:text-4xl">
                登录后台控制台
              </h1>
            </div>
          </div>

          <div className="space-y-4">
            <Separator className="bg-white/10" />
            <div className="flex items-center justify-between gap-4 text-xs text-[#748073]">
              <span>{siteConfig.name}</span>
              <span className="tracking-[0.12em] uppercase">
                Private workspace
              </span>
            </div>
          </div>
        </div>

        <form
          method="post"
          action={adminLoginAction}
          className="grid gap-5 px-6 py-8 sm:px-8 sm:py-10"
        >
          <div>
            <p className="text-base font-semibold text-[#edf3e9]">管理员登录</p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="admin-login-email" className="text-[#dce6d8]">
              邮箱
            </Label>
            <Input
              id="admin-login-email"
              type="email"
              name="email"
              required
              autoComplete="email"
              placeholder="admin@example.com"
              className="admin-input"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="admin-login-password" className="text-[#dce6d8]">
              密码
            </Label>
            <Input
              id="admin-login-password"
              type="password"
              name="password"
              required
              autoComplete="current-password"
              placeholder="输入管理员密码"
              className="admin-input"
            />
          </div>

          {error ? (
            <p className="text-sm text-[#f08b81]" role="alert">
              {error}
            </p>
          ) : null}

          <Button type="submit" className="w-full justify-center">
            进入控制台
            <ArrowRight className="size-4" aria-hidden="true" />
          </Button>
        </form>
      </section>
    </main>
  )
}
export default function Page(
  props: Awaited<ReturnType<typeof load>> & { location: string }
) {
  return (
    <IslandProvider location={props.location}>
      <View {...props} />
    </IslandProvider>
  )
}
