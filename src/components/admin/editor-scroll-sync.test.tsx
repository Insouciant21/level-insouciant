// @vitest-environment jsdom

import * as React from "react"
import { fireEvent, render } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import {
  syncScrollPosition,
  useEditorScrollSync,
} from "@/components/admin/editor-scroll-sync"

function defineScrollMetrics(
  element: HTMLElement,
  metrics: { scrollHeight: number; clientHeight: number }
) {
  Object.defineProperties(element, {
    scrollTop: {
      configurable: true,
      value: 0,
      writable: true,
    },
    scrollHeight: {
      configurable: true,
      value: metrics.scrollHeight,
    },
    clientHeight: {
      configurable: true,
      value: metrics.clientHeight,
    },
  })
}

function ScrollSyncHarness() {
  const sourceRef = React.useRef<HTMLDivElement>(null)
  const targetRef = React.useRef<HTMLDivElement>(null)

  useEditorScrollSync(sourceRef, targetRef, true)

  return (
    <>
      <div ref={sourceRef} data-testid="scroll-source" />
      <div ref={targetRef} data-testid="scroll-target" />
    </>
  )
}

describe("editor scroll synchronization", () => {
  it("maps source scroll progress to the target scroll range", () => {
    const source = { scrollTop: 150, scrollHeight: 650, clientHeight: 150 }
    const target = { scrollTop: 0, scrollHeight: 1150, clientHeight: 150 }

    syncScrollPosition(source, target)

    expect(target.scrollTop).toBe(300)
  })

  it("does not move a target without a scrollable range", () => {
    const source = { scrollTop: 150, scrollHeight: 650, clientHeight: 150 }
    const target = { scrollTop: 12, scrollHeight: 150, clientHeight: 150 }

    syncScrollPosition(source, target)

    expect(target.scrollTop).toBe(12)
  })

  it("syncs scroll events and removes listeners on cleanup", () => {
    const { getByTestId, unmount } = render(<ScrollSyncHarness />)
    const source = getByTestId("scroll-source")
    const target = getByTestId("scroll-target")

    defineScrollMetrics(source, { scrollHeight: 650, clientHeight: 150 })
    defineScrollMetrics(target, { scrollHeight: 1150, clientHeight: 150 })

    source.scrollTop = 150
    fireEvent.scroll(source)

    expect(target.scrollTop).toBe(300)

    unmount()
    target.scrollTop = 0
    source.scrollTop = 100
    fireEvent.scroll(source)

    expect(target.scrollTop).toBe(0)
  })
})
