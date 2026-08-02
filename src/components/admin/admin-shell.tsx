"use client"

import { useState, type ReactNode } from "react"
import Link from "next/link"
import {
  BarChart3,
  ChevronRight,
  ExternalLink,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  PanelLeft,
  Tags,
  UserRound,
  X,
  type LucideIcon,
} from "lucide-react"
import { usePathname } from "next/navigation"

import { logoutAction } from "@/app/actions/auth"
import { Button } from "@/components/ui/button"
import { PerfectScrollbar } from "@/components/ui/perfect-scrollbar"
import { cn } from "@/lib/utils"

type AdminShellProps = {
  userName: string
  children: ReactNode
}

const navigationItems = [
  {
    href: "/admin/dashboard",
    label: "概览",
    description: "运营总览",
    icon: LayoutDashboard,
  },
  {
    href: "/admin/articles",
    label: "文章",
    description: "内容管理",
    icon: FileText,
  },
  {
    href: "/admin/comments",
    label: "评论",
    description: "审核互动",
    icon: MessageSquare,
  },
  { href: "/admin/tags", label: "标签", description: "整理主题", icon: Tags },
  {
    href: "/admin/stats",
    label: "统计",
    description: "内容表现",
    icon: BarChart3,
  },
  {
    href: "/admin/account",
    label: "我的资料",
    description: "账号设置",
    icon: UserRound,
  },
] satisfies Array<{
  href: string
  label: string
  description: string
  icon: LucideIcon
}>

function isActiveNavItem(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}

function AdminShell({ userName, children }: AdminShellProps) {
  const pathname = usePathname()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const activeItem =
    navigationItems.find((item) => isActiveNavItem(pathname, item.href)) ??
    navigationItems[0]

  return (
    <div className="admin-console flex min-h-svh flex-1 flex-col selection:bg-[#b8d77c]/25 md:flex-row">
      <aside className="sticky top-0 z-30 flex w-full flex-col border-b border-white/10 bg-[#10130f] md:h-svh md:min-h-svh md:w-64 md:shrink-0 md:self-start md:overflow-hidden md:border-r md:border-b-0">
        <PerfectScrollbar
          aria-label="后台侧栏"
          tabIndex={0}
          className="flex min-h-0 flex-1 flex-col md:h-svh md:max-h-svh"
        >
          <div className="border-b border-white/10 px-4 py-4 sm:px-5">
            <div className="flex items-center justify-between gap-3">
              <Link
                href="/admin/dashboard"
                className="flex min-w-0 items-center gap-3 text-[#edf3e9]"
                onClick={() => setMobileNavOpen(false)}
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-md border border-[#b8d77c]/35 bg-[#b8d77c]/10 text-[#b8d77c]">
                  <PanelLeft className="size-4" aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold tracking-wide">
                    Level Insouciant
                  </span>
                  <span className="mt-0.5 block text-xs text-[#748073]">
                    管理控制台
                  </span>
                </span>
              </Link>

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
                {mobileNavOpen ? (
                  <X className="size-4" />
                ) : (
                  <Menu className="size-4" />
                )}
              </Button>
            </div>
          </div>

          <nav
            id="admin-shell-navigation"
            className={cn(
              "px-3 py-4 md:flex-1 md:px-4 md:py-6",
              mobileNavOpen ? "block" : "hidden",
              "md:block"
            )}
            aria-label="后台导航"
          >
            <div className="mb-3 flex items-center justify-between px-2">
              <p className="admin-kicker">Workspace</p>
              <span className="text-[0.62rem] font-medium tracking-[0.14em] text-[#748073]">
                ADMIN
              </span>
            </div>
            <ul className="grid gap-1.5">
              {navigationItems.map((item) => {
                const Icon = item.icon
                const active = isActiveNavItem(pathname, item.href)

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setMobileNavOpen(false)}
                      className={cn(
                        "group flex items-center gap-3 rounded-md border px-3 py-2.5 transition",
                        active
                          ? "border-[#b8d77c]/30 bg-[#b8d77c]/10 text-[#d0ec93]"
                          : "border-transparent text-[#9aa79a] hover:border-white/10 hover:bg-white/5 hover:text-[#edf3e9]"
                      )}
                      aria-current={active ? "page" : undefined}
                    >
                      <Icon className="size-4 shrink-0" aria-hidden="true" />
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium">
                          {item.label}
                        </span>
                        <span
                          className={cn(
                            "mt-0.5 block text-xs",
                            active ? "text-[#a9c77a]" : "text-[#748073]"
                          )}
                        >
                          {item.description}
                        </span>
                      </span>
                      <ChevronRight
                        className={cn(
                          "size-3.5 shrink-0 transition-transform",
                          active
                            ? "text-[#b8d77c]"
                            : "text-[#4f5b4c] group-hover:translate-x-0.5"
                        )}
                        aria-hidden="true"
                      />
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          <div
            className={cn(
              "border-t border-white/10 px-3 py-4 md:px-4 md:py-5",
              mobileNavOpen ? "block" : "hidden",
              "md:block"
            )}
          >
            <div className="flex items-center gap-3 rounded-md border border-white/10 bg-white/[0.03] px-3 py-2.5">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#b8d77c]/15 text-xs font-semibold text-[#d0ec93]">
                {userName.slice(0, 1).toUpperCase()}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-[#edf3e9]">
                  {userName}
                </p>
                <p className="mt-0.5 text-xs text-[#748073]">管理员账户</p>
              </div>
            </div>

            <div className="mt-3 grid gap-1">
              <Link
                href="/"
                onClick={() => setMobileNavOpen(false)}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-[#9aa79a] transition hover:bg-white/5 hover:text-[#edf3e9]"
              >
                <ExternalLink className="size-3.5" aria-hidden="true" />
                查看站点
              </Link>
              <form action={logoutAction}>
                <input type="hidden" name="redirectTo" value="/admin/login" />
                <Button
                  type="submit"
                  variant="ghost"
                  className="w-full justify-start gap-2 px-3"
                  onClick={() => setMobileNavOpen(false)}
                >
                  <LogOut className="size-3.5" aria-hidden="true" />
                  退出登录
                </Button>
              </form>
            </div>
          </div>
        </PerfectScrollbar>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col bg-[#151914]">
        <div className="border-b border-white/10 bg-[#151914]/95 px-4 py-3 sm:px-6 lg:px-8">
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-2 text-xs text-[#9aa79a]">
              <span className="font-semibold tracking-[0.14em] text-[#748073] uppercase">
                Admin
              </span>
              <ChevronRight
                className="size-3.5 shrink-0 text-[#4f5b4c]"
                aria-hidden="true"
              />
              <span className="truncate">{activeItem.label}</span>
            </div>
            <span className="admin-status-pill admin-status-live shrink-0">
              <span
                className="size-1.5 rounded-full bg-[#b8d77c]"
                aria-hidden="true"
              />
              已连接
            </span>
          </div>
        </div>

        <div className="mx-auto flex w-full max-w-7xl min-w-0 flex-1 flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  )
}

export { AdminShell }
