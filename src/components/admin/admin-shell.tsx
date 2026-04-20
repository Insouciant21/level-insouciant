import type { ReactNode } from "react"
import Link from "next/link"

import { logoutAction } from "@/app/actions/auth"
import { Button } from "@/components/ui/button"

type AdminShellProps = {
  userName: string
  children: ReactNode
}

const adminNav = [
  { href: "/admin/dashboard", label: "概览" },
  { href: "/admin/articles", label: "文章" },
  { href: "/admin/comments", label: "评论" },
  { href: "/admin/tags", label: "标签" },
  { href: "/admin/stats", label: "统计" },
  { href: "/account", label: "我的资料" },
]

function AdminShell({ userName, children }: AdminShellProps) {
  return (
    <div className="admin-console relative flex min-h-svh flex-1 flex-col bg-[#101010] text-[#e7e0d0] md:flex-row selection:bg-[#3fb46b]/30">
      <div className="pointer-events-none fixed inset-0 z-10 opacity-[0.05] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.05),rgba(0,255,0,0.02),rgba(0,0,255,0.05))] bg-[length:100%_4px,3px_100%]" />

      <aside className="relative z-20 w-full border-b border-white/10 bg-[#0a0a0a] md:w-72 md:border-b-0 md:border-r">
        <div className="border-b border-white/10 px-5 py-5">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.32em] text-[#ff6d61]">
            M.E.G. Secure
          </p>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-[#f3ecdb]">Admin Console</h1>
          <p className="mt-2 text-xs uppercase tracking-[0.24em] text-[#8c9482]">
            Auth Level: Alpha // {userName}
          </p>
        </div>

        <nav className="px-4 py-5" aria-label="后台导航">
          <p className="mb-3 text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-[#687166]">
            Systems
          </p>
          <ul className="grid gap-2">
            {adminNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center justify-between border border-transparent px-3 py-2 text-sm uppercase tracking-[0.22em] text-[#c9c3b4] transition hover:border-[#2b7748] hover:bg-[#162117] hover:text-[#8fe0a8]"
                >
                  <span>{item.label}</span>
                  <span className="text-[#4a5148]">&gt;</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-auto grid gap-3 border-t border-white/10 px-4 py-5">
          <Link
            href="/"
            className="text-xs uppercase tracking-[0.24em] text-[#8c9482] transition hover:text-[#d8d1c1]"
          >
            Exit Console
          </Link>
          <form action={logoutAction}>
            <input type="hidden" name="redirectTo" value="/admin/login" />
            <Button type="submit" variant="destructive" className="w-full justify-center">
              退出登录
            </Button>
          </form>
        </div>
      </aside>

      <main className="relative z-20 flex-1 bg-[#131313]">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-5 py-8 sm:px-6 lg:px-10">
          {children}
        </div>
      </main>
    </div>
  )
}

export { AdminShell }
