import Link from "@/lib/navigation"
import { ChevronDown, UserRound } from "lucide-react"

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
          size="sm"
          className="h-9 gap-2 border border-[#73766f]/55 bg-[#d9d1ad]/68 px-2 shadow-[inset_0_1px_0_rgba(255,252,225,0.22),0_10px_20px_-18px_rgba(0,0,0,0.24)] hover:border-foreground/30 hover:bg-[#c6bd99]/72"
          aria-label={user ? `${displayName} 的用户菜单` : "打开登录菜单"}
          title={user ? `${displayName} 的用户菜单` : "打开登录菜单"}
        >
          {user?.image ? (
            <span
              className="size-6 shrink-0 rounded-[2px] border border-[#73766f]/45 bg-cover bg-center"
              style={{ backgroundImage: `url(${user.image})` }}
              aria-hidden="true"
            />
          ) : (
            <span className="flex size-6 shrink-0 items-center justify-center rounded-[2px] border border-[#73766f]/40 bg-[#aaa891]/48 text-muted-foreground">
              <UserRound className="size-3.5" />
            </span>
          )}
          <span className="hidden max-w-[7rem] truncate font-mono text-[0.68rem] font-medium tracking-[0.06em] text-foreground/88 uppercase lg:inline">
            {user ? displayName : "访客"}
          </span>
          <ChevronDown
            className="hidden size-3 text-muted-foreground lg:inline"
            aria-hidden="true"
          />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="px-3 py-2">
          <p className="truncate text-sm font-medium text-foreground">
            {displayName}
          </p>
          <p className="mt-1 font-mono text-[0.68rem] font-normal tracking-[0.08em] text-muted-foreground uppercase">
            {user
              ? isAdmin
                ? "ADMIN // 管理员"
                : "USER // 成员"
              : "GUEST // 未登录"}
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
            <form
              method="post"
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
