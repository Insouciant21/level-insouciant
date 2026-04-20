"use client"

import * as React from "react"

type ReadingProgressBarProps = {
  targetId: string
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function ReadingProgressBar({ targetId }: ReadingProgressBarProps) {
  const [progress, setProgress] = React.useState(0)

  const updateProgress = React.useEffectEvent(() => {
    const target = document.getElementById(targetId)

    if (!target) {
      setProgress(0)
      return
    }

    const rect = target.getBoundingClientRect()
    const scrollTop = window.scrollY
    const viewportHeight = window.innerHeight
    const targetTop = scrollTop + rect.top
    const targetHeight = target.offsetHeight

    const start = targetTop - 96
    const end = targetTop + targetHeight - viewportHeight * 0.35

    if (end <= start) {
      setProgress(scrollTop > start ? 1 : 0)
      return
    }

    setProgress(clamp((scrollTop - start) / (end - start), 0, 1))
  })

  React.useEffect(() => {
    let frame = window.requestAnimationFrame(() => {
      updateProgress()
      frame = 0
    })

    function onScroll() {
      if (frame) {
        return
      }

      frame = window.requestAnimationFrame(() => {
        updateProgress()
        frame = 0
      })
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)

    return () => {
      if (frame) {
        window.cancelAnimationFrame(frame)
      }

      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
    }
  }, [])

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-50 h-1 bg-transparent">
      <div
        className="h-full origin-left bg-primary/85 shadow-[0_0_28px_rgba(154,90,62,0.26)] transition-transform duration-150 ease-out"
        style={{ transform: `scaleX(${progress})` }}
      />
    </div>
  )
}

export { ReadingProgressBar }
