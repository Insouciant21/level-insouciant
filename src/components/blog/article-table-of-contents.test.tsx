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

import { ArticleTableOfContents } from "@/components/blog/article-table-of-contents"

afterEach(cleanup)

describe("ArticleTableOfContents", () => {
  it("keeps the desktop index sticky inside the article boundary with an accessible internal scrollbar", () => {
    const { container } = render(
      <ArticleTableOfContents
        items={[
          { id: "overview", text: "Overview", depth: 2 },
          { id: "details", text: "Details", depth: 3 },
        ]}
        variant="desktop-floating"
      />
    )

    const navigation = screen.getByRole("navigation", { name: "文章目录" })
    const desktopSlot = navigation.closest("aside")

    expect(desktopSlot?.className).toContain("hidden")
    expect(desktopSlot?.className).toContain("xl:block")
    expect(desktopSlot?.className).toContain("xl:sticky")
    expect(desktopSlot?.className).toContain("xl:top-32")
    expect(desktopSlot?.className).toContain("xl:self-start")
    expect(container.querySelector(".fixed")).toBeNull()
    expect(container.querySelector(".perfect-scrollbar.ps")).not.toBeNull()
    const scrollRegion = screen.getByRole("region", {
      name: "文章目录滚动区域",
    })
    expect(scrollRegion.tabIndex).toBe(0)
    expect(navigation.contains(scrollRegion)).toBe(true)
    expect(
      scrollRegion.contains(screen.getByRole("heading", { name: "目录" }))
    ).toBe(false)
    expect(scrollRegion.contains(screen.getByText("Known Index"))).toBe(false)
    expect(
      scrollRegion.contains(screen.getByRole("link", { name: "Details" }))
    ).toBe(true)
    expect(scrollRegion.className).toContain("overflow-y-auto")
    expect(scrollRegion.className).toContain("overscroll-contain")
  })

  it("keeps the inline directory in normal document flow", () => {
    render(
      <ArticleTableOfContents
        items={[{ id: "overview", text: "Overview", depth: 2 }]}
      />
    )
    const navigation = screen.getByRole("navigation", { name: "文章目录" })
    expect(
      navigation.contains(screen.getByRole("heading", { name: "目录" }))
    ).toBe(true)
    expect(
      navigation.contains(screen.getByRole("link", { name: "Overview" }))
    ).toBe(true)
    expect(
      screen.queryByRole("region", { name: "文章目录滚动区域" })
    ).toBeNull()
  })
})
