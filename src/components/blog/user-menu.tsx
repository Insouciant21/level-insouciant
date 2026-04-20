import Link from "next/link"
import { UserRound } from "lucide-react"

import { logoutAction } from "@/app/actions/auth"
import { cn } from "@/lib/utils"

type UserMenuProps = {
  user:
    | {
        name?: string | null
        email?: string | null
        image?: string | null
        role?: "ADMIN" | "USER"
      }
    | null
}

function UserMenu({ user }: UserMenuProps) {
  const isAdmin = user?.role === "ADMIN"
  const displayName = user?.name?.trim() || user?.email || "游客"

  return (
    <details className="group relative">
      <summary
        className={cn(
          "flex size-10 cursor-pointer list-none items-center justify-center border border-border/80 bg-card/72 text-foreground outline-none transition hover:border-foreground/20 hover:bg-card focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30",
          "[&::-webkit-details-marker]:hidden"
        )}
        aria-label={user ? `${displayName} 的用户菜单` : "打开登录菜单"}
      >
        {user?.image ? (
          <span
            className="size-9 bg-cover bg-center"
            style={{ backgroundImage: `url(${user.image})` }}
          />
        ) : (
          <span className="flex size-9 items-center justify-center bg-muted text-muted-foreground">
            <UserRound className="size-4" />
          </span>
        )}
      </summary>

      <div className="absolute right-0 top-[calc(100%+0.75rem)] z-50 w-60 border border-border/80 bg-card/94 p-2 shadow-[0_28px_70px_-30px_rgba(0,0,0,0.3)] backdrop-blur-xl">
        <div className="px-3 py-3">
          <p className="text-sm font-medium text-foreground">{displayName}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {user ? (isAdmin ? "管理员账号" : "普通用户账号") : "未登录"}
          </p>
        </div>

        <div className="grid gap-1 border-t border-border/60 pt-2">
          {user ? (
            <>
              <Link
                href={isAdmin ? "/admin" : "/account"}
                className="px-3 py-2 text-sm text-muted-foreground transition hover:bg-muted/65 hover:text-foreground"
              >
                {isAdmin ? "后台管理" : "用户管理"}
              </Link>

              <form action={logoutAction}>
                <input type="hidden" name="redirectTo" value="/" />
                <button
                  type="submit"
                  className="w-full px-3 py-2 text-left text-sm text-muted-foreground transition hover:bg-muted/65 hover:text-foreground"
                >
                  注销
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/login"
              className="px-3 py-2 text-sm text-muted-foreground transition hover:bg-muted/65 hover:text-foreground"
            >
              登录
            </Link>
          )}
        </div>
      </div>
    </details>
  )
}

export { UserMenu }
