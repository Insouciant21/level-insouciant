import { describe, expect, it } from "vitest"
import type { APIContext } from "astro"
import { cache, requestStorage, safeRedirect } from "./request-context"

describe("request isolation", () => {
  it("memoizes within one request and never across concurrent requests", async () => {
    let calls = 0
    const read = cache(async () => ++calls)
    const request = () =>
      requestStorage.run(
        { context: {} as APIContext, memo: new Map(), headers: new Headers() },
        async () => {
          const first = await read()
          await Promise.resolve()
          expect(await read()).toBe(first)
          return first
        }
      )
    expect(new Set(await Promise.all([request(), request()])).size).toBe(2)
    expect(calls).toBe(2)
  })
  it("only permits local redirect paths", () => {
    for (const path of [
      "//evil.test",
      "/\\evil.test",
      "https://evil.test",
      "/\r\nLocation: bad",
    ])
      expect(safeRedirect(path)).toBe("/")
    expect(safeRedirect("/articles/test#comments")).toBe(
      "/articles/test#comments"
    )
  })
})
