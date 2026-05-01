import type { ReactNode } from "react"

import { MotionReveal } from "@/components/motion/page-transition"

export default function Template({ children }: { children: ReactNode }) {
  return <MotionReveal variant="panel">{children}</MotionReveal>
}
