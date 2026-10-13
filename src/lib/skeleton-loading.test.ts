import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
describe("Astro document", () => {
  it("keeps the page slot outside client-only rendering", () => {
    const layout = readFileSync(new URL("../layouts/BaseLayout.astro", import.meta.url), "utf8")
    expect(layout).toContain("<slot />")
    expect(layout).not.toContain("client:only")
  })
})
