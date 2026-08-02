"use client"

import type { ReactNode } from "react"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"

type SiteFrameProps = {
  children: ReactNode
  header: ReactNode
  footer: ReactNode
}

function SiteFrame({ children, header, footer }: SiteFrameProps) {
  const pathname = usePathname()
  const isAdminRoute = pathname.startsWith("/admin")
  const isPublicRoute = !isAdminRoute

  return (
    <div
      className={cn(
        "flex min-h-svh flex-col",
        isPublicRoute ? "site-console relative overflow-x-hidden" : null
      )}
    >
      {isPublicRoute ? (
        <>
          <div
            aria-hidden="true"
            className="public-atmosphere-base pointer-events-none fixed inset-0 z-[1]"
          />
          <div
            aria-hidden="true"
            className="public-atmosphere-grain pointer-events-none fixed inset-0 z-[1]"
          />
          <div
            aria-hidden="true"
            className="public-atmosphere-scanline pointer-events-none fixed inset-0 z-[1]"
          />
          <div
            aria-hidden="true"
            className="public-atmosphere-vignette pointer-events-none fixed inset-0 z-[1]"
          />
        </>
      ) : null}

      <div
        className={cn(
          "flex min-h-svh flex-col",
          isPublicRoute ? "relative z-10" : null
        )}
      >
        {isAdminRoute ? null : header}
        {children}
        {isAdminRoute ? null : footer}
      </div>
    </div>
  )
}

export { SiteFrame }
