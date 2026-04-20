"use client"

import type { ReactNode } from "react"
import { usePathname } from "next/navigation"

type SiteFrameProps = {
  children: ReactNode
  header: ReactNode
  footer: ReactNode
}

function SiteFrame({ children, header, footer }: SiteFrameProps) {
  const pathname = usePathname()
  const isAdminRoute = pathname.startsWith("/admin")

  return (
    <div className="flex min-h-svh flex-col">
      {isAdminRoute ? null : header}
      {children}
      {isAdminRoute ? null : footer}
    </div>
  )
}

export { SiteFrame }
