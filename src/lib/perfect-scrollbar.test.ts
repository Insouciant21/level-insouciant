import { describe, expect, it, vi } from "vitest"

import {
  createPerfectScrollbarController,
  defaultPerfectScrollbarOptions,
  type PerfectScrollbarConstructor,
} from "@/lib/perfect-scrollbar"

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
})
