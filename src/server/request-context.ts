import { AsyncLocalStorage } from "node:async_hooks"
import type { APIContext } from "astro"

export const requestStorage = new AsyncLocalStorage<{
  context: APIContext
  memo: Map<unknown, Map<string, unknown>>
  headers: Headers
}>()
export function requestContext() {
  const store = requestStorage.getStore()
  if (!store) throw new Error("No active request context")
  return store
}
/** Request-scoped only: never retain sessions or mutable database reads between requests. */
export function cache<A extends unknown[], R>(
  fn: (...args: A) => R
): (...args: A) => R {
  return (...args) => {
    const store = requestStorage.getStore()
    if (!store) return fn(...args)
    let entries = store.memo.get(fn)
    if (!entries) store.memo.set(fn, (entries = new Map()))
    const key = JSON.stringify(args)
    if (!entries.has(key)) entries.set(key, fn(...args))
    return entries.get(key) as R
  }
}
export class HttpSignal extends Error {
  constructor(
    public status: number,
    public location?: string
  ) {
    super(`HTTP ${status}`)
  }
}
export function redirect(location: string): never {
  throw new HttpSignal(303, location)
}
export function notFound(): never {
  throw new HttpSignal(404)
}
export function safeRedirect(value: string, fallback = "/") {
  return value.startsWith("/") &&
    !value.startsWith("//") &&
    !/[\\\r\n]/.test(value)
    ? value
    : fallback
}
