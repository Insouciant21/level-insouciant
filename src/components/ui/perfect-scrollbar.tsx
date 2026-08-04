"use client"

import {
  useEffect,
  useRef,
  type ComponentPropsWithoutRef,
  type MutableRefObject,
  type ReactNode,
} from "react"
import PerfectScrollbarPrimitive from "perfect-scrollbar"

import { createPerfectScrollbarController } from "@/lib/perfect-scrollbar"
import { cn } from "@/lib/utils"

type PerfectScrollbarProps = ComponentPropsWithoutRef<"div"> & {
  children: ReactNode
  scrollContainerRef?: MutableRefObject<HTMLElement | null>
}

function PerfectScrollbar({
  children,
  className,
  scrollContainerRef,
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
    if (scrollContainerRef) {
      scrollContainerRef.current = element
    }
    controller.update()

    return () => {
      controller.destroy()
      controllerRef.current = null
      if (scrollContainerRef?.current === element) {
        scrollContainerRef.current = null
      }
    }
  }, [scrollContainerRef])

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
