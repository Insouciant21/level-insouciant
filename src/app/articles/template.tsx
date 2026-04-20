import type { ReactNode } from "react"

import { MotionReveal } from "@/components/motion/page-transition"

export default function ArticlesTemplate({ children }: { children: ReactNode }) {
  return <MotionReveal variant="fade">{children}</MotionReveal>
}
