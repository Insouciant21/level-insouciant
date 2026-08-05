// @vitest-environment jsdom

import { cleanup, render } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

vi.mock("next/navigation", () => ({
  usePathname: () => "/articles/hello-insous",
}))

import { SiteFrame } from "@/components/blog/site-frame"

afterEach(cleanup)

describe("SiteFrame", () => {
  it("clips horizontal decoration without becoming the sticky scroll container", () => {
    const { container } = render(
      <SiteFrame
        header={<header>Header</header>}
        footer={<footer>Footer</footer>}
      >
        <main>Article</main>
      </SiteFrame>
    )

    const frame = container.firstElementChild as HTMLElement | null

    expect(frame?.className).toContain("overflow-x-clip")
    expect(frame?.className).not.toContain("overflow-x-hidden")
  })
})
