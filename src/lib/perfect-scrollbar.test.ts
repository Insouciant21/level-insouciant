// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest"

import {
  createPerfectScrollbarController,
  defaultPerfectScrollbarOptions,
  type PerfectScrollbarConstructor,
} from "@/lib/perfect-scrollbar"

afterEach(() => vi.unstubAllGlobals())

describe("createPerfectScrollbarController", () => {
  it("creates a vertical-only instance with the default interaction options", () => {
    const element = {} as HTMLElement
    const instance = { update: vi.fn(), destroy: vi.fn() }
    const constructor = vi.fn()
    class FakePerfectScrollbar {
      update = instance.update
      destroy = instance.destroy

      constructor(receivedElement: HTMLElement, options: object) {
        constructor(receivedElement, options)
      }
    }

    createPerfectScrollbarController(
      element,
      FakePerfectScrollbar as unknown as PerfectScrollbarConstructor
    )

    expect(constructor).toHaveBeenCalledWith(
      element,
      defaultPerfectScrollbarOptions
    )
  })

  it("forwards update and cleanup to the library instance", () => {
    const constructor = vi.fn()
    const instance = { update: vi.fn(), destroy: vi.fn() }
    class FakePerfectScrollbar {
      update() {
        instance.update()
      }

      destroy() {
        instance.destroy()
      }

      constructor(receivedElement: HTMLElement, options: object) {
        constructor(receivedElement, options)
      }
    }
    const controller = createPerfectScrollbarController(
      {} as HTMLElement,
      FakePerfectScrollbar as unknown as PerfectScrollbarConstructor,
      { wheelSpeed: 2 }
    )

    controller.update()
    controller.destroy()

    expect(instance.update).toHaveBeenCalledOnce()
    expect(instance.destroy).toHaveBeenCalledOnce()
    expect(constructor).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        suppressScrollX: true,
        wheelPropagation: false,
        wheelSpeed: 2,
      })
    )
  })

  it("refreshes after layout changes and cancels pending updates on cleanup", () => {
    let onResize: () => void = () => undefined
    const observe = vi.fn()
    const disconnect = vi.fn()
    class FakeResizeObserver {
      observe = observe
      unobserve = vi.fn()
      disconnect = disconnect
      constructor(callback: () => void) {
        onResize = callback
      }
    }
    const frames: FrameRequestCallback[] = []
    const cancel = vi.fn()
    vi.stubGlobal("ResizeObserver", FakeResizeObserver)
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) =>
      frames.push(callback)
    )
    vi.stubGlobal("cancelAnimationFrame", cancel)
    const element = document.createElement("div")
    const content = document.createElement("nav")
    const rail = document.createElement("div")
    rail.className = "ps__rail-y"
    element.append(content, rail)
    const instance = { update: vi.fn(), destroy: vi.fn() }
    const controller = createPerfectScrollbarController(
      element,
      class {
        update = instance.update
        destroy = instance.destroy
      }
    )

    expect(observe).toHaveBeenCalledWith(element)
    expect(observe).toHaveBeenCalledWith(content)
    expect(observe).not.toHaveBeenCalledWith(rail)
    onResize()
    frames[0](0)
    expect(instance.update).toHaveBeenCalledOnce()
    onResize()
    controller.destroy()
    expect(disconnect).toHaveBeenCalledOnce()
    expect(cancel).toHaveBeenCalledWith(2)
    expect(instance.destroy).toHaveBeenCalledOnce()
  })
})
