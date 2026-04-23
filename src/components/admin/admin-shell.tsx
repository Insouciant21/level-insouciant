"use client"

import { useState, type ReactNode } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { usePathname } from "next/navigation"

import { logoutAction } from "@/app/actions/auth"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

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
  { href: "/admin/account", label: "我的资料" },
]

function isActiveNavItem(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}

function AdminShell({ userName, children }: AdminShellProps) {
  const pathname = usePathname()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  return (
    <div className="admin-console relative flex min-h-svh flex-1 flex-col bg-[#111111] text-[#e0e0e0] md:flex-row selection:bg-green-500/30">
      <div className="pointer-events-none fixed inset-0 z-10 opacity-[0.05] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]" />

      <aside className="sticky top-0 z-30 flex w-full flex-col border-b border-[#333333] bg-[#0a0a0a] md:z-20 md:h-svh md:w-72 md:shrink-0 md:self-start md:overflow-y-auto md:border-b-0 md:border-r">
        <div className="border-b border-[#333333] px-4 py-4 sm:px-5 sm:py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.32em] text-red-500">
                M.E.G. Secure
              </p>
              <h1 className="mt-3 text-xl font-semibold tracking-tight text-[#e0e0e0] sm:text-2xl">
                Admin Console
              </h1>
              <p className="mt-2 break-words text-xs uppercase tracking-[0.24em] text-gray-500">
                Auth Level: Alpha // {userName}
              </p>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="shrink-0 md:hidden"
              onClick={() => setMobileNavOpen((open) => !open)}
              aria-expanded={mobileNavOpen}
              aria-controls="admin-shell-navigation"
              aria-label={mobileNavOpen ? "收起后台导航" : "展开后台导航"}
            >
              {mobileNavOpen ? <X className="size-4" /> : <Menu className="size-4" />}
            </Button>
          </div>
        </div>

        <nav
          id="admin-shell-navigation"
          className={cn("px-4 py-5", mobileNavOpen ? "block" : "hidden", "md:block")}
          aria-label="后台导航"
        >
          <p className="mb-3 text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-gray-600">
            Systems
          </p>
          <ul className="grid gap-2">
            {adminNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setMobileNavOpen(false)}
                  className={cn(
                    "flex items-center justify-between border px-3 py-2 text-sm uppercase tracking-[0.22em] transition",
                    isActiveNavItem(pathname, item.href)
                      ? "border-green-900 bg-[#1a2e1a] text-green-400 shadow-[inset_2px_0_0_#4ade80]"
                      : "border-transparent text-gray-400 hover:bg-[#1a1a1a] hover:text-gray-200"
                  )}
                >
                  <span>{item.label}</span>
                  <span className="text-[#4a4a4a]">&gt;</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div
          className={cn(
            "mt-auto grid gap-3 border-t border-[#333333] px-4 py-5",
            mobileNavOpen ? "grid" : "hidden",
            "md:grid"
          )}
        >
          <Link
            href="/"
            onClick={() => setMobileNavOpen(false)}
            className="text-xs uppercase tracking-[0.24em] text-gray-500 transition hover:text-gray-300"
          >
            Exit Console
          </Link>
          <form action={logoutAction}>
            <input type="hidden" name="redirectTo" value="/admin/login" />
            <Button
              type="submit"
              variant="destructive"
              className="w-full justify-center"
              onClick={() => setMobileNavOpen(false)}
            >
              退出登录
            </Button>
          </form>
        </div>
      </aside>

      <main className="relative z-20 flex-1 bg-[#141414]">
        <div className="mx-auto flex w-full max-w-6xl min-w-0 flex-col gap-8 px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
          {children}
        </div>
      </main>
    </div>
  )
}

export { AdminShell }
