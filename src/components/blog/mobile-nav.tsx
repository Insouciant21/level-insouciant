"use client"

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

type MobileNavProps = {
  user: UserMenuUser | null
  config: {
    name: string
    nav: Array<{
      href: string
      label: string
    }>
  }
}

function MobileNav({ user, config }: MobileNavProps) {
  const accountHref = user?.role === "ADMIN" ? "/admin/dashboard" : "/account"
  const avatarUrl = user?.image?.trim() || null

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-10 border-[#73766f]/52 bg-[#d9d1ad]/56 md:hidden"
          aria-label="打开导航菜单"
          title="打开导航菜单"
        >
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="w-[min(88vw,22rem)] px-5">
        <SheetHeader className="border-b border-border/60 px-0 pb-5">
          <p className="utility-kicker">Navigation Relay</p>
          <SheetTitle className="mt-2 text-2xl tracking-tight">
            {config.name}
          </SheetTitle>
          <SheetDescription className="leading-7">
            选择一条入口，继续浏览公开档案。
          </SheetDescription>
        </SheetHeader>

        <nav aria-label="移动端主导航" className="grid gap-2">
          {config.nav.map((item) => (
            <SheetClose key={item.href} asChild>
              <Link
                href={item.href}
                className="group flex items-center justify-between border border-transparent px-3 py-3 text-sm font-semibold tracking-[0.2em] text-muted-foreground uppercase transition hover:border-[#73766f]/45 hover:bg-[#c6bd99]/48 hover:text-foreground"
              >
                <span>{item.label}</span>
                <ArrowUpRight className="size-4 opacity-45 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
              </Link>
            </SheetClose>
          ))}
        </nav>

        <div className="mt-auto border-t border-border/60 pt-5">
          <div className="flex items-center gap-3 px-3">
            <span
              className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#73766f]/45 bg-[#aaa891]/42 bg-cover bg-center text-muted-foreground"
              data-testid="mobile-nav-user-avatar"
              style={avatarUrl ? { backgroundImage: `url(${avatarUrl})` } : undefined}
              aria-hidden="true"
            >
              {avatarUrl ? null : <UserRound className="size-4" />}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">
                {user?.name?.trim() || user?.email || "游客"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {user ? (user.role === "ADMIN" ? "管理员" : "用户") : "未登录"}
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-2">
            {user ? (
              <>
                <SheetClose asChild>
                  <Link
                    href={accountHref}
                    className="border border-[#73766f]/45 bg-[#c6bd99]/32 px-3 py-2.5 text-center text-sm font-semibold tracking-[0.18em] text-foreground uppercase transition hover:bg-[#c6bd99]/58"
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
                  className="border border-primary/65 bg-primary px-3 py-2.5 text-center text-sm font-semibold tracking-[0.18em] text-primary-foreground uppercase transition hover:bg-primary/85"
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
