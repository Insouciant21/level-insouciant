import type { ReactNode } from "react"
import type { TargetAndTransition, Transition, Variant } from "motion/react"
import { motion as Motion, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"

type TransitionVariant =
  "fade" | "fadeUp" | "left" | "right" | "scale" | "panel" | "terminal" | "wipe"
type TransitionState = {
  initial: TargetAndTransition
  animate: TargetAndTransition
  duration: number
  ease?: Transition["ease"]
}

type MotionRevealProps = {
  children: ReactNode
  className?: string
  delay?: number
  duration?: number
  variant?: TransitionVariant
}

type MotionStaggerProps = {
  children: ReactNode
  className?: string
  delay?: number
  duration?: number
  stagger?: number
}

const industrialEase: [number, number, number, number] = [0.22, 1, 0.36, 1]

const transitionStates: Record<TransitionVariant, TransitionState> = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    duration: 0.24,
    ease: industrialEase,
  },
  fadeUp: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    duration: 0.32,
    ease: industrialEase,
  },
  left: {
    initial: { opacity: 0, x: -12 },
    animate: { opacity: 1, x: 0 },
    duration: 0.32,
    ease: industrialEase,
  },
  right: {
    initial: { opacity: 0, x: 12 },
    animate: { opacity: 1, x: 0 },
    duration: 0.32,
    ease: industrialEase,
  },
  scale: {
    initial: { opacity: 0, scale: 0.985 },
    animate: { opacity: 1, scale: 1 },
    duration: 0.28,
    ease: industrialEase,
  },
  panel: {
    initial: {
      opacity: 0,
      y: 10,
      scale: 0.992,
    },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
    },
    duration: 0.34,
    ease: industrialEase,
  },
  terminal: {
    initial: {
      opacity: 0,
      y: 8,
    },
    animate: {
      opacity: 1,
      y: 0,
    },
    duration: 0.28,
    ease: industrialEase,
  },
  wipe: {
    initial: {
      opacity: 0,
      y: 6,
    },
    animate: {
      opacity: 1,
      y: 0,
    },
    duration: 0.28,
    ease: industrialEase,
  },
}

function MotionReveal({
  children,
  className,
  delay = 0,
  duration,
  variant = "fadeUp",
}: MotionRevealProps) {
  const reducedMotion = useReducedMotion()
  const state = transitionStates[variant]

  return (
    <Motion.div
      initial={reducedMotion ? false : state.initial}
      animate={state.animate}
      transition={{
        duration: reducedMotion ? 0 : (duration ?? state.duration),
        delay: reducedMotion ? 0 : delay,
        ease: state.ease ?? "easeOut",
      }}
      className={className}
    >
      {children}
    </Motion.div>
  )
}

function MotionStagger({
  children,
  className,
  delay = 0,
  duration = 0.3,
  stagger = 0.045,
}: MotionStaggerProps) {
  const reducedMotion = useReducedMotion()

  return (
    <Motion.div
      initial={reducedMotion ? false : "hidden"}
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: {
            delayChildren: reducedMotion ? 0 : delay,
            staggerChildren: reducedMotion ? 0 : stagger,
          },
        },
      }}
      transition={{
        duration: reducedMotion ? 0 : duration,
        ease: industrialEase,
      }}
      className={className}
    >
      {children}
    </Motion.div>
  )
}

function MotionStaggerItem({
  children,
  className,
  variant = "fadeUp",
}: Omit<MotionRevealProps, "delay" | "duration">) {
  const reducedMotion = useReducedMotion()
  const state = transitionStates[variant]

  return (
    <Motion.div
      variants={{
        hidden: (reducedMotion ? {} : state.initial) as Variant,
        visible: state.animate as Variant,
      }}
      transition={{
        duration: reducedMotion ? 0 : state.duration,
        ease: state.ease ?? "easeOut",
      }}
      className={cn(className)}
    >
      {children}
    </Motion.div>
  )
}

export { MotionReveal, MotionStagger, MotionStaggerItem }
