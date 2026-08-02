"use client"

import {
  useEffect,
  useRef,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from "react"
import PerfectScrollbarPrimitive from "perfect-scrollbar"

import {
  createPerfectScrollbarController,
} from "@/lib/perfect-scrollbar"
import { cn } from "@/lib/utils"

type PerfectScrollbarProps = ComponentPropsWithoutRef<"div"> & {
  children: ReactNode
}

function PerfectScrollbar({
  children,
  className,
  ...props
}: PerfectScrollbarProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const controllerRef = useRef<ReturnType<
    typeof createPerfectScrollbarController
  > | null>(null)

  useEffect(() => {
    const element = containerRef.current

    if (!element) {
      return
    }

    const controller = createPerfectScrollbarController(
      element,
      PerfectScrollbarPrimitive
    )
    controllerRef.current = controller
    controller.update()

    return () => {
      controller.destroy()
      controllerRef.current = null
    }
  }, [])

  useEffect(() => {
    controllerRef.current?.update()
  }, [children])

  return (
    <div
      ref={containerRef}
      className={cn("perfect-scrollbar", className)}
      {...props}
    >
      {children}
    </div>
  )
}

export { PerfectScrollbar }
