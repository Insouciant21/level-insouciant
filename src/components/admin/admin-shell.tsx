"use client"

import { type ReactNode } from "react"
import Link from "@/lib/navigation"
import {
  BarChart3,
  ChevronRight,
  ExternalLink,
  FileText,
  Images,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Settings2,
  Tags,
  UserRound,
  type LucideIcon,
} from "lucide-react"
import { usePathname } from "@/lib/navigation"

import { logoutAction } from "@/lib/action-links"
import { Button } from "@/components/ui/button"
import { PerfectScrollbar } from "@/components/ui/perfect-scrollbar"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

type AdminShellProps = {
  userName: string
  userImage?: string | null
  siteIconUrl: string
  siteName: string
  children: ReactNode
}

const navigationItems = [
  {
    href: "/admin/dashboard",
    label: "概览",
    icon: LayoutDashboard,
  },
  {
    href: "/admin/articles",
    label: "文章",
    icon: FileText,
  },
  {
    href: "/admin/media",
    label: "媒体库",
    icon: Images,
  },
  {
    href: "/admin/comments",
    label: "评论",
    icon: MessageSquare,
  },
  { href: "/admin/tags", label: "标签", icon: Tags },
  {
    href: "/admin/stats",
    label: "统计",
    icon: BarChart3,
  },
  {
    href: "/admin/settings",
    label: "设置",
    icon: Settings2,
  },
  {
    href: "/admin/account",
    label: "我的资料",
    icon: UserRound,
  },
] satisfies Array<{
  href: string
  label: string
  icon: LucideIcon
}>

function AdminSiteIcon({ siteIconUrl }: { siteIconUrl: string }) {
  return (
    <span
      aria-hidden="true"
      className="flex size-9 shrink-0 items-center justify-center rounded-md border border-[var(--safety-exit-green)]/35 bg-[var(--safety-exit-green)]/10 bg-contain bg-center bg-no-repeat p-1.5"
      data-testid="admin-site-icon"
      style={{ backgroundImage: `url(${siteIconUrl})` }}
    />
  )
}

function AdminAvatar({
  userName,
  userImage,
  className,
}: {
  userName: string
  userImage?: string | null
  className?: string
}) {
  const imageUrl = userImage?.trim() || null
  const initials = userName.trim().slice(0, 1).toUpperCase() || "?"

  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--safety-exit-green)]/15 text-xs font-semibold text-[var(--safety-exit-green-strong)] bg-cover bg-center",
        className
      )}
      data-testid="admin-user-avatar"
      style={imageUrl ? { backgroundImage: `url(${imageUrl})` } : undefined}
    >
      {imageUrl ? null : initials}
    </span>
  )
}

function isActiveNavItem(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}

function AdminMobileNav({
  userName,
  userImage,
  siteIconUrl,
  siteName,
}: {
  userName: string
  userImage?: string | null
  siteIconUrl: string
  siteName: string
}) {
  return (
    <div className="sticky top-0 z-40 border-b border-white/10 bg-[#10130f] md:hidden">
      <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link
          href="/admin/dashboard"
          className="flex min-w-0 items-center gap-3 text-[#edf3e9]"
        >
          <AdminSiteIcon siteIconUrl={siteIconUrl} />
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold tracking-wide">
              {siteName}
            </span>
            <span className="mt-0.5 block text-xs text-[#748073]">
              管理控制台
            </span>
          </span>
        </Link>

        <Sheet>
          <SheetTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-10 border border-white/10 bg-white/[0.03] text-[var(--safety-exit-green-strong)] hover:bg-white/10 hover:text-[#edf3e9]"
              aria-label="打开后台导航"
              title="打开后台导航"
            >
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>

          <SheetContent
            side="right"
            className="w-[min(88vw,22rem)] border-[var(--safety-exit-green)]/20 bg-[#10130f] px-5 text-[#edf3e9]"
          >
            <SheetHeader className="border-b border-white/10 px-0 pb-5">
              <p className="admin-kicker">Workspace Relay</p>
              <SheetTitle className="mt-2 text-2xl tracking-tight text-[#edf3e9]">
                管理控制台
              </SheetTitle>
              <SheetDescription className="leading-7 text-[#748073]">
                选择一个入口，继续管理站点内容。
              </SheetDescription>
            </SheetHeader>

            <nav aria-label="移动端后台导航" className="grid gap-2">
              {navigationItems.map((item) => {
                const Icon = item.icon

                return (
                  <SheetClose key={item.href} asChild>
                    <Link
                      href={item.href}
                      className="group flex items-center gap-3 border border-transparent px-3 py-3 text-[#9aa79a] transition hover:border-white/10 hover:bg-white/5 hover:text-[#edf3e9]"
                    >
                      <Icon className="size-4 shrink-0" aria-hidden="true" />
                      <span className="min-w-0 flex-1 text-sm font-medium text-[#edf3e9]">
                        {item.label}
                      </span>
                      <ChevronRight
                        className="size-3.5 shrink-0 text-[#748073] transition-transform group-hover:translate-x-0.5"
                        aria-hidden="true"
                      />
                    </Link>
                  </SheetClose>
                )
              })}
            </nav>

            <div className="mt-auto border-t border-white/10 pt-5">
              <div className="flex items-center gap-3 px-3">
                <AdminAvatar
                  userName={userName}
                  userImage={userImage}
                  className="size-9"
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-[#edf3e9]">
                    {userName}
                  </p>
                  <p className="mt-0.5 text-xs text-[#748073]">管理员账户</p>
                </div>
              </div>

              <div className="mt-4 grid gap-2">
                <SheetClose asChild>
                  <Link
                    href="/"
                    className="flex items-center gap-2 border border-transparent px-3 py-2.5 text-sm text-[#9aa79a] transition hover:border-white/10 hover:bg-white/5 hover:text-[#edf3e9]"
                  >
                    <ExternalLink className="size-3.5" aria-hidden="true" />
                    查看站点
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <form method="post" action={logoutAction}>
                    <input
                      type="hidden"
                      name="redirectTo"
                      value="/admin/login"
                    />
                    <Button
                      type="submit"
                      variant="ghost"
                      className="w-full justify-start gap-2 px-3 text-[#9aa79a] hover:text-[#edf3e9]"
                    >
                      <LogOut className="size-3.5" aria-hidden="true" />
                      退出登录
                    </Button>
                  </form>
                </SheetClose>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}

function AdminShell({
  userName,
  userImage,
  siteIconUrl,
  siteName,
  children,
}: AdminShellProps) {
  const pathname = usePathname()
  const activeItem =
    navigationItems.find((item) => isActiveNavItem(pathname, item.href)) ??
    navigationItems[0]

  return (
    <div className="admin-console flex min-h-svh flex-1 flex-col selection:bg-[var(--safety-exit-green)]/25 md:flex-row">
      <aside className="sticky top-0 z-30 hidden w-full flex-col border-b border-white/10 bg-[#10130f] md:flex md:h-svh md:min-h-svh md:w-64 md:shrink-0 md:self-start md:overflow-hidden md:border-r md:border-b-0">
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
              >
                <AdminSiteIcon siteIconUrl={siteIconUrl} />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold tracking-wide">
                    {siteName}
                  </span>
                  <span className="mt-0.5 block text-xs text-[#748073]">
                    管理控制台
                  </span>
                </span>
              </Link>

            </div>
          </div>

          <nav
            id="admin-shell-navigation"
            className="flex-1 px-3 py-4 md:px-4 md:py-6"
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
                      className={cn(
                        "group flex items-center gap-3 rounded-md border px-3 py-2.5 transition",
                        active
                          ? "border-[var(--safety-exit-green)]/30 bg-[var(--safety-exit-green)]/10 text-[var(--safety-exit-green-strong)]"
                          : "border-transparent text-[#9aa79a] hover:border-white/10 hover:bg-white/5 hover:text-[#edf3e9]"
                      )}
                      aria-current={active ? "page" : undefined}
                    >
                      <Icon className="size-4 shrink-0" aria-hidden="true" />
                      <span className="min-w-0 flex-1 text-sm font-medium">
                        {item.label}
                      </span>
                      <ChevronRight
                        className={cn(
                          "size-3.5 shrink-0 transition-transform",
                          active
                            ? "text-[var(--safety-exit-green)]"
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
            className="border-t border-white/10 px-3 py-4 md:px-4 md:py-5"
          >
            <div className="flex items-center gap-3 rounded-md border border-white/10 bg-white/[0.03] px-3 py-2.5">
              <AdminAvatar
                userName={userName}
                userImage={userImage}
                className="size-8"
              />
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
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-[#9aa79a] transition hover:bg-white/5 hover:text-[#edf3e9]"
              >
                <ExternalLink className="size-3.5" aria-hidden="true" />
                查看站点
              </Link>
              <form method="post" action={logoutAction}>
                <input type="hidden" name="redirectTo" value="/admin/login" />
                <Button
                  type="submit"
                  variant="ghost"
                  className="w-full justify-start gap-2 px-3"
                >
                  <LogOut className="size-3.5" aria-hidden="true" />
                  退出登录
                </Button>
              </form>
            </div>
          </div>
        </PerfectScrollbar>
      </aside>

      <AdminMobileNav
        userName={userName}
        userImage={userImage}
        siteIconUrl={siteIconUrl}
        siteName={siteName}
      />

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
                className="size-1.5 rounded-full bg-[var(--safety-exit-green)]"
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
