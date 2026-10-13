import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
describe("Astro site frame", () => {
  it("clips decoration without becoming the sticky scroll container", () => {
    const layout = readFileSync(new URL("../../layouts/BaseLayout.astro", import.meta.url), "utf8")
    expect(layout).toContain("site-console relative overflow-x-clip")
    expect(layout).not.toContain("overflow-x-hidden")
  })
})
