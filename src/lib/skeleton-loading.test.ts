import { existsSync } from "node:fs"
import path from "node:path"

import { describe, expect, it } from "vitest"

describe("loading route selectors", () => {
  it("does not provide a skeleton loading route for the about page", () => {
    expect(
      existsSync(path.join(process.cwd(), "src/app/about/loading.tsx"))
    ).toBe(false)
  })
})
