import type { ReactNode } from "react"
import Link from "next/link"

import { logoutAction } from "@/app/actions/auth"
import { Button } from "@/components/ui/button"

type AdminShellProps = {
  userName: string
  children: ReactNode
}

const adminNav = [
  { href: "/admin", label: "概览" },
  { href: "/admin/articles", label: "文章" },
  { href: "/admin/comments", label: "评论" },
  { href: "/admin/tags", label: "标签" },
  { href: "/admin/stats", label: "统计" },
]

function AdminShell({ userName, children }: AdminShellProps) {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-5 py-8 sm:px-6">
      <section className="surface-panel px-6 py-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Admin Console</p>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">博客后台</h1>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                当前以管理员身份登录：{userName}
              </p>
            </div>
          </div>

          <form action={logoutAction}>
            <input type="hidden" name="redirectTo" value="/admin/login" />
            <Button type="submit" variant="outline" className="rounded-full">
              退出登录
            </Button>
          </form>
        </div>

        <nav className="mt-6" aria-label="后台导航">
          <ul className="flex flex-wrap gap-2">
            {adminNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="inline-flex rounded-full border border-border/70 bg-background/70 px-4 py-2 text-sm text-muted-foreground transition hover:text-foreground"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </section>

      {children}
    </main>
  )
}

export { AdminShell }
