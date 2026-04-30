"use client"

import * as React from "react"
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

const userMenuTriggerClass =
  "flex size-10 cursor-pointer list-none items-center justify-center border border-[#73766f]/52 bg-[#d9d1ad]/56 text-foreground shadow-[inset_0_1px_0_rgba(255,252,225,0.2),0_12px_24px_-20px_rgba(0,0,0,0.22)] outline-none transition duration-500 hover:border-foreground/20 hover:bg-[#c6bd99]/62 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
const userMenuAvatarFallbackClass =
  "flex size-9 items-center justify-center bg-[#aaa891]/42 text-muted-foreground"
const userMenuPanelClass =
  "absolute right-0 top-[calc(100%+0.75rem)] z-50 w-60 border border-[#73766f]/52 bg-[#d9d1ad]/94 p-2 shadow-[inset_0_1px_0_rgba(255,252,225,0.24),0_28px_70px_-30px_rgba(0,0,0,0.3)] backdrop-blur-xl"
const userMenuItemClass =
  "px-3 py-2 text-sm text-muted-foreground transition duration-500 hover:bg-[#c6bd99]/48 hover:text-foreground"

function UserMenu({ user }: UserMenuProps) {
  const isAdmin = user?.role === "ADMIN"
  const displayName = user?.name?.trim() || user?.email || "游客"
  const detailsRef = React.useRef<HTMLDetailsElement>(null)
  const summaryRef = React.useRef<HTMLElement>(null)

  const closeMenu = React.useEffectEvent((focusTrigger = false) => {
    const details = detailsRef.current

    if (!details?.open) {
      return
    }

    details.open = false

    if (focusTrigger) {
      summaryRef.current?.focus()
    }
  })

  React.useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      const details = detailsRef.current

      if (!details?.open) {
        return
      }

      if (event.target instanceof Node && details.contains(event.target)) {
        return
      }

      closeMenu()
    }

    function onFocusIn(event: FocusEvent) {
      const details = detailsRef.current

      if (!details?.open) {
        return
      }

      if (event.target instanceof Node && details.contains(event.target)) {
        return
      }

      closeMenu()
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") {
        return
      }

      closeMenu(true)
    }

    document.addEventListener("pointerdown", onPointerDown)
    document.addEventListener("focusin", onFocusIn)
    document.addEventListener("keydown", onKeyDown)

    return () => {
      document.removeEventListener("pointerdown", onPointerDown)
      document.removeEventListener("focusin", onFocusIn)
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [])

  return (
    <details ref={detailsRef} className="group relative">
      <summary
        ref={summaryRef}
        className={cn(
          userMenuTriggerClass,
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
          <span className={userMenuAvatarFallbackClass}>
            <UserRound className="size-4" />
          </span>
        )}
      </summary>

      <div className={userMenuPanelClass}>
        <div className="px-3 py-3">
          <p className="text-sm font-medium text-foreground">{displayName}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {user ? (isAdmin ? "管理员" : "用户") : "未登录"}
          </p>
        </div>

        <div className="grid gap-1 border-t border-border/60 pt-2">
          {user ? (
            <>
              <Link
                href={isAdmin ? "/admin/dashboard" : "/account"}
                className={userMenuItemClass}
              >
                {isAdmin ? "后台管理" : "用户管理"}
              </Link>

              <form action={logoutAction}>
                <input type="hidden" name="redirectTo" value="/" />
                <button
                  type="submit"
                  className={cn("w-full text-left", userMenuItemClass)}
                >
                  注销
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/login"
              className={userMenuItemClass}
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
