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
  { href: "/account", label: "我的资料" },
]

function isActiveNavItem(pathname: string, href: string) {
  if (href === "/account") {
    return pathname === href
  }

  return pathname === href || pathname.startsWith(`${href}/`)
}

function AdminShell({ userName, children }: AdminShellProps) {
  const pathname = usePathname()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  return (
    <div className="admin-console relative flex min-h-svh flex-1 flex-col bg-[#101010] text-[#e7e0d0] md:flex-row selection:bg-[#3fb46b]/30">
      <div className="pointer-events-none fixed inset-0 z-10 opacity-[0.05] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.05),rgba(0,255,0,0.02),rgba(0,0,255,0.05))] bg-[length:100%_4px,3px_100%]" />

      <aside className="sticky top-0 z-30 flex w-full flex-col border-b border-white/10 bg-[#0a0a0a] md:z-20 md:h-svh md:w-72 md:shrink-0 md:self-start md:overflow-y-auto md:border-b-0 md:border-r">
        <div className="border-b border-white/10 px-4 py-4 sm:px-5 sm:py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.32em] text-[#ff6d61]">
                M.E.G. Secure
              </p>
              <h1 className="mt-3 text-xl font-semibold tracking-tight text-[#f3ecdb] sm:text-2xl">
                Admin Console
              </h1>
              <p className="mt-2 break-words text-xs uppercase tracking-[0.24em] text-[#8c9482]">
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
          <p className="mb-3 text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-[#687166]">
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
                      ? "border-[#2b7748] bg-[#162117] text-[#8fe0a8]"
                      : "border-transparent text-[#c9c3b4] hover:border-[#2b7748] hover:bg-[#162117] hover:text-[#8fe0a8]"
                  )}
                >
                  <span>{item.label}</span>
                  <span className="text-[#4a5148]">&gt;</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div
          className={cn(
            "mt-auto grid gap-3 border-t border-white/10 px-4 py-5",
            mobileNavOpen ? "grid" : "hidden",
            "md:grid"
          )}
        >
          <Link
            href="/"
            onClick={() => setMobileNavOpen(false)}
            className="text-xs uppercase tracking-[0.24em] text-[#8c9482] transition hover:text-[#d8d1c1]"
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

      <main className="relative z-20 flex-1 bg-[#131313]">
        <div className="mx-auto flex w-full max-w-6xl min-w-0 flex-col gap-8 px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
          {children}
        </div>
      </main>
    </div>
  )
}

export { AdminShell }
