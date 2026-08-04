import * as React from "react"

type ScrollableElement = {
  scrollTop: number
  scrollHeight: number
  clientHeight: number
}

function getScrollMaximum(element: ScrollableElement) {
  return Math.max(element.scrollHeight - element.clientHeight, 0)
}

function syncScrollPosition(
  source: ScrollableElement,
  target: ScrollableElement
) {
  const sourceMaximum = getScrollMaximum(source)
  const targetMaximum = getScrollMaximum(target)

  if (sourceMaximum === 0 || targetMaximum === 0) {
    return
  }

  const progress = Math.min(
    Math.max(source.scrollTop / sourceMaximum, 0),
    1
  )

  target.scrollTop = progress * targetMaximum
}

function useEditorScrollSync(
  sourceRef: React.RefObject<HTMLElement | null>,
  targetRef: React.RefObject<HTMLElement | null>,
  enabled: boolean
) {
  React.useEffect(() => {
    if (!enabled) {
      return
    }

    const source = sourceRef.current
    const target = targetRef.current

    if (!source || !target) {
      return
    }

    let isSyncing = false
    let releaseFrame: number | null = null
    let releaseTimer: number | null = null

    const releaseSyncLock = () => {
      isSyncing = false
      releaseFrame = null
      releaseTimer = null
    }

    const scheduleRelease = () => {
      if (
        typeof window !== "undefined" &&
        typeof window.requestAnimationFrame === "function"
      ) {
        releaseFrame = window.requestAnimationFrame(releaseSyncLock)
        return
      }

      if (typeof window !== "undefined") {
        releaseTimer = window.setTimeout(releaseSyncLock, 0)
      }
    }

    const sync = (from: HTMLElement, to: HTMLElement) => {
      if (isSyncing) {
        return
      }

      isSyncing = true
      syncScrollPosition(from, to)
      scheduleRelease()
    }

    const handleSourceScroll = () => {
      sync(source, target)
    }

    const handleTargetScroll = () => {
      sync(target, source)
    }

    source.addEventListener("scroll", handleSourceScroll, { passive: true })
    target.addEventListener("scroll", handleTargetScroll, { passive: true })

    return () => {
      source.removeEventListener("scroll", handleSourceScroll)
      target.removeEventListener("scroll", handleTargetScroll)

      if (releaseFrame !== null && typeof window !== "undefined") {
        window.cancelAnimationFrame(releaseFrame)
      }

      if (releaseTimer !== null && typeof window !== "undefined") {
        window.clearTimeout(releaseTimer)
      }
    }
  }, [enabled, sourceRef, targetRef])
}

export { syncScrollPosition, useEditorScrollSync }
export type { ScrollableElement }
