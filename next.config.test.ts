import { describe, expect, it } from "vitest"

import nextConfig from "./next.config.mjs"

describe("Next image configuration", () => {
  it("allows versioned generated site icons without widening local image access", () => {
    expect(nextConfig.images?.localPatterns).toEqual([
      { pathname: "/site-icons/**" },
    ])
  })
})

describe("Next server output tracing", () => {
  it("includes Sharp Linux native runtime assets", () => {
    const includes = nextConfig.outputFileTracingIncludes?.["/*"] ?? []

    expect(includes).toEqual(
      expect.arrayContaining([
        "node_modules/.pnpm/@img+sharp-libvips-linux-x64@*/node_modules/@img/sharp-libvips-linux-x64/lib/**/*",
        "node_modules/.pnpm/@img+sharp-linux-x64@*/node_modules/@img/sharp-linux-x64/lib/**/*",
      ]),
    )
  })
})
