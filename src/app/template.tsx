"use client"

import type { ReactNode } from "react"
import { usePathname } from "next/navigation"

import { MotionReveal } from "@/components/motion/page-transition"

export default function Template({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  if (pathname.startsWith("/admin")) {
    return children
  }

  return <MotionReveal variant="panel">{children}</MotionReveal>
}
