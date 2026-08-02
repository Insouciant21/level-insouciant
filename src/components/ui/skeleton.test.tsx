// @vitest-environment jsdom

import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Skeleton } from "@/components/ui/skeleton"

describe("Skeleton", () => {
  it("renders each semantic tone while remaining hidden from assistive technology", () => {
    render(
      <>
        <Skeleton />
        <Skeleton tone="soft" />
        <Skeleton tone="accent" />
        <Skeleton tone="inverse" />
      </>
    )

    const skeletons = screen
      .getAllByRole("generic", { hidden: true })
      .filter((node) => node.getAttribute("aria-hidden") === "true")

    expect(skeletons).toHaveLength(4)
    expect(
      skeletons.every((node) => node.getAttribute("aria-hidden") === "true")
    ).toBe(true)
    expect(
      skeletons.map((node) => node.getAttribute("data-skeleton-tone"))
    ).toEqual(["neutral", "soft", "accent", "inverse"])
  })
})
