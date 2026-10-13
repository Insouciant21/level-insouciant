"use client"

import Link from "@/lib/navigation"
import { UserRound } from "lucide-react"

import { logoutAction } from "@/lib/action-links"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export type UserMenuUser = {
  name?: string | null
  email?: string | null
  image?: string | null
  role?: "ADMIN" | "USER"
}

type UserMenuProps = {
  user: UserMenuUser | null
}

function UserMenu({ user }: UserMenuProps) {
  const isAdmin = user?.role === "ADMIN"
  const displayName = user?.name?.trim() || user?.email || "游客"

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-10 border-[#73766f]/52 bg-[#d9d1ad]/56 shadow-[inset_0_1px_0_rgba(255,252,225,0.2),0_12px_24px_-20px_rgba(0,0,0,0.22)] hover:border-foreground/20 hover:bg-[#c6bd99]/62"
          aria-label={user ? `${displayName} 的用户菜单` : "打开登录菜单"}
          title={user ? `${displayName} 的用户菜单` : "打开登录菜单"}
        >
          {user?.image ? (
            <span
              className="size-9 bg-cover bg-center"
              style={{ backgroundImage: `url(${user.image})` }}
              aria-hidden="true"
            />
          ) : (
            <span className="flex size-9 items-center justify-center bg-[#aaa891]/42 text-muted-foreground">
              <UserRound className="size-4" />
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="px-3 py-2">
          <p className="text-sm font-medium text-foreground">{displayName}</p>
          <p className="mt-1 text-xs font-normal text-muted-foreground">
            {user ? (isAdmin ? "管理员" : "用户") : "未登录"}
          </p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border/60" />

        {user ? (
          <>
            <DropdownMenuItem asChild>
              <Link href={isAdmin ? "/admin/dashboard" : "/account"}>
                {isAdmin ? "后台管理" : "用户管理"}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild variant="destructive">
              <button
                type="submit"
                form="site-user-logout"
                className="w-full text-left"
              >
                注销
              </button>
            </DropdownMenuItem>
            <form method="post"
              id="site-user-logout"
              action={logoutAction}
              className="hidden"
            >
              <input type="hidden" name="redirectTo" value="/" />
            </form>
          </>
        ) : (
          <DropdownMenuItem asChild>
            <Link href="/login">登录</Link>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export { UserMenu }
