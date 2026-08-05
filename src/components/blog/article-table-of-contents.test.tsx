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
  it("keeps the desktop index fixed without an internal scrollbar", () => {
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
    const floatingPanel = navigation.parentElement

    expect(desktopSlot?.className).toContain("hidden")
    expect(desktopSlot?.className).toContain("xl:block")
    expect(floatingPanel?.className).toContain("fixed")
    expect(floatingPanel?.className).toContain("top-32")
    expect(floatingPanel?.className).toContain("w-[320px]")
    expect(floatingPanel?.style.right).toContain("max(")
    expect(floatingPanel?.style.right).toContain("1200px")
    expect(container.querySelector(".perfect-scrollbar")).toBeNull()
    expect(container.querySelector("[tabindex]")).toBeNull()
  })
})
