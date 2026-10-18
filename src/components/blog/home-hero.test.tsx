// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react"
import type { ComponentProps } from "react"
import { afterEach, describe, expect, it, vi } from "vitest"

vi.mock("@/lib/navigation", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/navigation")>()),
  default: ({ children, ...props }: ComponentProps<"a">) => (
    <a {...props}>{children}</a>
  ),
}))

import { HomeHero } from "@/components/blog/home-hero"

afterEach(cleanup)

describe("HomeHero", () => {
  it("renders the title without calls to action or a divider", () => {
    render(
      <HomeHero
        eyebrow="Archive Notes"
        title="Level Insouciant"
        stats={[{ label: "公开记录", value: "03" }]}
      />
    )

    const heading = screen.getByRole("heading", { name: "Level Insouciant" })

    expect(heading.parentElement?.querySelector("p")).toBeNull()
    expect(screen.queryByRole("link")).toBeNull()
    expect(document.querySelector(".site-section-header")).toBeNull()
  })
})
