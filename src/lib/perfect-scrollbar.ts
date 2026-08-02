export type PerfectScrollbarOptions = {
  suppressScrollX?: boolean
  wheelPropagation?: boolean
  wheelSpeed?: number
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

  return {
    update: () => instance.update(),
    destroy: () => instance.destroy(),
  }
}

export { createPerfectScrollbarController }
