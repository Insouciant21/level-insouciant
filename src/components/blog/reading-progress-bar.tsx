import type { RefObject } from "react"
import { motion as Motion, useScroll, useSpring } from "motion/react"

type ReadingProgressBarProps = {
  targetRef: RefObject<HTMLElement | null>
}

function ReadingProgressBar({ targetRef }: ReadingProgressBarProps) {
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start 96px", "end 35vh"],
  })
  const progress = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 30,
    restDelta: 0.001,
  })

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-50 h-[3px] bg-transparent">
      <Motion.div
        className="h-full origin-left bg-primary shadow-[0_0_12px_rgb(var(--safety-exit-green-rgb)/45%)] transition-transform duration-150 ease-out"
        style={{ scaleX: progress }}
      />
    </div>
  )
}

export { ReadingProgressBar }
