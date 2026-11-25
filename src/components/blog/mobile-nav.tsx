import Link from "@/lib/navigation"
import { ArrowUpRight, Menu, UserRound } from "lucide-react"

import { logoutAction } from "@/lib/action-links"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import type { UserMenuUser } from "@/components/blog/user-menu"
import { cn } from "@/lib/utils"

type MobileNavProps = {
  user: UserMenuUser | null
  pathname?: string
  config: {
    name: string
    nav: Array<{
      href: string
      label: string
    }>
  }
}

function isNavItemActive(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/"
  }

  return pathname === href || pathname.startsWith(`${href}/`)
}

function MobileNav({ user, pathname = "/", config }: MobileNavProps) {
  const accountHref = user?.role === "ADMIN" ? "/admin/dashboard" : "/account"
  const avatarUrl = user?.image?.trim() || null

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-9 border border-[#73766f]/55 bg-[#d9d1ad]/72 md:hidden"
          aria-label="打开导航菜单"
          title="打开导航菜单"
        >
          <Menu className="size-4" />
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="w-[min(88vw,22rem)] px-5 pb-6">
        <SheetHeader className="border-b border-border/70 px-0 pb-5">
          <p className="utility-kicker">Navigation Relay</p>
          <SheetTitle className="mt-2 font-mono text-xl tracking-[0.06em] uppercase">
            {config.name}
          </SheetTitle>
          <SheetDescription className="leading-6">
            选择一条通道，继续浏览公开层级档案。
          </SheetDescription>
        </SheetHeader>

        <nav aria-label="移动端主导航" className="grid gap-1.5">
          {config.nav.map((item, index) => {
            const active = isNavItemActive(pathname, item.href)

            return (
              <SheetClose key={item.href} asChild>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "group flex items-center justify-between rounded-[var(--radius)] border px-3 py-2.5 text-sm font-semibold tracking-[0.18em] uppercase transition",
                    active
                      ? "border-primary/45 bg-primary/10 text-foreground"
                      : "border-transparent text-muted-foreground hover:border-[#73766f]/45 hover:bg-[#c6bd99]/48 hover:text-foreground"
                  )}
                >
                  <span className="flex items-center gap-3">
                    <span className="font-mono text-[0.65rem] text-muted-foreground/80">
                      0{index + 1}
                    </span>
                    <span>{item.label}</span>
                  </span>
                  <ArrowUpRight
                    className={cn(
                      "size-4 transition",
                      active
                        ? "text-primary opacity-100"
                        : "opacity-45 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100"
                    )}
                  />
                </Link>
              </SheetClose>
            )
          })}
        </nav>

        <div className="mt-auto border-t border-border/70 pt-5">
          <div className="flex items-center gap-3 rounded-[var(--radius)] border border-[#73766f]/40 bg-[#c6bd99]/28 px-3 py-2.5">
            <span
              className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-[var(--radius)] border border-[#73766f]/50 bg-[#aaa891]/45 bg-cover bg-center text-muted-foreground"
              data-testid="mobile-nav-user-avatar"
              style={
                avatarUrl ? { backgroundImage: `url(${avatarUrl})` } : undefined
              }
              aria-hidden="true"
            >
              {avatarUrl ? null : <UserRound className="size-4" />}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">
                {user?.name?.trim() || user?.email || "游客"}
              </p>
              <p className="mt-0.5 font-mono text-[0.68rem] tracking-[0.08em] text-muted-foreground uppercase">
                {user
                  ? user.role === "ADMIN"
                    ? "ADMIN // 管理员"
                    : "USER // 已认证"
                  : "GUEST // 未登录"}
              </p>
            </div>
          </div>

          <div className="mt-3 grid gap-2">
            {user ? (
              <>
                <SheetClose asChild>
                  <Link
                    href={accountHref}
                    className="rounded-[var(--radius)] border border-[#73766f]/50 bg-[#c6bd99]/40 px-3 py-2.5 text-center text-sm font-semibold tracking-[0.18em] text-foreground uppercase transition hover:bg-[#c6bd99]/68"
                  >
                    {user.role === "ADMIN" ? "进入后台" : "进入资料页"}
                  </Link>
                </SheetClose>
                <form method="post" action={logoutAction}>
                  <input type="hidden" name="redirectTo" value="/" />
                  <Button
                    type="submit"
                    variant="outline"
                    className="w-full justify-center"
                  >
                    注销
                  </Button>
                </form>
              </>
            ) : (
              <SheetClose asChild>
                <Link
                  href="/login"
                  className="rounded-[var(--radius)] border border-primary/65 bg-primary px-3 py-2.5 text-center text-sm font-semibold tracking-[0.18em] text-primary-foreground uppercase transition hover:bg-primary/85"
                >
                  登录
                </Link>
              </SheetClose>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export { MobileNav }
