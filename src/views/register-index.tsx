import Link from "@/lib/navigation"
import { userRegisterAction } from "@/lib/action-links"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
const authPanelClass =
  "public-summary-panel-document px-6 py-8 sm:px-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]"
import type { load } from "@/server/pages/register-index"
import { IslandProvider } from "@/components/providers/island-provider"
function View({ next, error }: Awaited<ReturnType<typeof load>>) {
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

        <form method="post" action={userRegisterAction} className="grid gap-4">
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
export default function Page(
  props: Awaited<ReturnType<typeof load>> & { location: string }
) {
  return (
    <IslandProvider location={props.location}>
      <View {...props} />
    </IslandProvider>
  )
}
