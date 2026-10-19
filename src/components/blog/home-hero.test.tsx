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
    render(<HomeHero title="Level Insouciant" />)

    const heading = screen.getByRole("heading", { name: "Level Insouciant" })

    expect(heading.parentElement?.querySelector("h1 + p")).toBeNull()
    expect(screen.getByText("Facility Hub // Entry Node")).toBeTruthy()
    expect(document.querySelector("svg")).toBeNull()
    expect(screen.queryByRole("link")).toBeNull()
    expect(document.querySelector(".site-section-header")).toBeNull()
    expect(document.querySelector(".site-metric-card")).toBeNull()
  })
})
