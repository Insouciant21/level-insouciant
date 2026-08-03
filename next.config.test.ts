import { describe, expect, it } from "vitest"

import nextConfig from "./next.config.mjs"

describe("Next image configuration", () => {
  it("allows versioned generated site icons without widening local image access", () => {
    expect(nextConfig.images?.localPatterns).toEqual([
      { pathname: "/site-icons/**" },
    ])
  })
})
