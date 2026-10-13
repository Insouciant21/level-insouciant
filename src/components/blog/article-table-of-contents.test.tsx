// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react"
import type { ComponentProps } from "react"
import { afterEach, describe, expect, it, vi } from "vitest"

vi.mock("next/link", () => ({
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
    expect(container.querySelector(".perfect-scrollbar")).toBeNull()
    const scrollRegion = screen.getByRole("region", { name: "文章目录滚动区域" })
    expect(scrollRegion.tabIndex).toBe(0)
    expect(scrollRegion.contains(navigation)).toBe(true)
    expect(scrollRegion.className).toContain("overflow-y-auto")
    expect(scrollRegion.className).toContain("overscroll-contain")
  })
})
