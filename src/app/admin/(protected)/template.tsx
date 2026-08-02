import type { ReactNode } from "react"

import { MotionReveal } from "@/components/motion/page-transition"

export default function AdminProtectedTemplate({
  children,
}: {
  children: ReactNode
}) {
  return <MotionReveal variant="terminal">{children}</MotionReveal>
}
