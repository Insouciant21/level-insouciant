"use client"

import type { ReactNode } from "react"
import type { TargetAndTransition, Transition, Variant } from "motion/react"
import { motion as Motion, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"

type TransitionVariant = "fade" | "fadeUp" | "left" | "right" | "scale" | "panel" | "terminal" | "wipe"
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

const industrialEase: [number, number, number, number] = [0.18, 0.82, 0.16, 1]

const transitionStates: Record<TransitionVariant, TransitionState> = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    duration: 0.8,
  },
  fadeUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    duration: 0.8,
  },
  left: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    duration: 0.8,
  },
  right: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    duration: 0.8,
  },
  scale: {
    initial: { opacity: 0, scale: 0.98 },
    animate: { opacity: 1, scale: 1 },
    duration: 0.6,
  },
  panel: {
    initial: {
      opacity: 0,
      y: 18,
      clipPath: "polygon(0 0, 82% 0, 68% 100%, 0 100%)",
      filter: "brightness(0.94) contrast(1.04)",
    },
    animate: {
      opacity: 1,
      y: 0,
      clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
      filter: "brightness(1) contrast(1)",
      transitionEnd: { clipPath: "none", filter: "none" },
    },
    duration: 0.75,
    ease: industrialEase,
  },
  terminal: {
    initial: {
      opacity: 0,
      x: -16,
      clipPath: "inset(0 100% 0 0)",
      filter: "brightness(0.92) contrast(1.08)",
    },
    animate: {
      opacity: 1,
      x: 0,
      clipPath: "inset(0 0% 0 0)",
      filter: "brightness(1) contrast(1)",
      transitionEnd: { clipPath: "none", filter: "none" },
    },
    duration: 0.62,
    ease: industrialEase,
  },
  wipe: {
    initial: {
      opacity: 0,
      clipPath: "inset(0 0 100% 0)",
      filter: "brightness(0.96)",
    },
    animate: {
      opacity: 1,
      clipPath: "inset(0 0 0% 0)",
      filter: "brightness(1)",
      transitionEnd: { clipPath: "none", filter: "none" },
    },
    duration: 0.68,
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
  duration = 0.6,
  stagger = 0.1,
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
            delayChildren: delay,
            staggerChildren: stagger,
          },
        },
      }}
      transition={{
        duration: reducedMotion ? 0 : duration,
        ease: "easeOut",
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
