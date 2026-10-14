export type PerfectScrollbarOptions = {
  suppressScrollX?: boolean
  wheelPropagation?: boolean
  wheelSpeed?: number
  scrollYMarginOffset?: number
}

export type PerfectScrollbarInstance = {
  update: () => void
  destroy: () => void
}

export type PerfectScrollbarConstructor = new (
  element: string | Element,
  options?: PerfectScrollbarOptions
) => PerfectScrollbarInstance

export const defaultPerfectScrollbarOptions = {
  suppressScrollX: true,
  wheelPropagation: false,
  // The library floors bounding-box heights; zoom can create a false 1px overflow.
  scrollYMarginOffset: 1,
} satisfies PerfectScrollbarOptions

function createPerfectScrollbarController(
  element: HTMLElement,
  Constructor: PerfectScrollbarConstructor,
  options: PerfectScrollbarOptions = {}
) {
  const instance = new Constructor(element, {
    ...defaultPerfectScrollbarOptions,
    ...options,
  })
  let frame: number | undefined
  const observedChildren = new Set<Element>()
  const resizeObserver =
    typeof ResizeObserver === "undefined"
      ? null
      : new ResizeObserver(() => {
          if (frame !== undefined) return
          frame = requestAnimationFrame(() => {
            frame = undefined
            instance.update()
          })
        })

  function observeContent() {
    if (!resizeObserver) return
    const children = new Set(
      [...element.children].filter(
        (child) => !child.matches(".ps__rail-x, .ps__rail-y")
      )
    )
    for (const child of observedChildren) {
      if (!children.has(child)) {
        resizeObserver.unobserve(child)
        observedChildren.delete(child)
      }
    }
    for (const child of children) {
      if (!observedChildren.has(child)) {
        resizeObserver.observe(child)
        observedChildren.add(child)
      }
    }
  }

  resizeObserver?.observe(element)
  observeContent()

  return {
    update: () => {
      observeContent()
      instance.update()
    },
    destroy: () => {
      resizeObserver?.disconnect()
      if (frame !== undefined) cancelAnimationFrame(frame)
      instance.destroy()
    },
  }
}

export { createPerfectScrollbarController }
