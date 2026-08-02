// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react"
import type { ComponentProps, ReactNode } from "react"
import { afterEach, describe, expect, it, vi } from "vitest"

vi.mock("next/link", () => ({
  default: ({ children, ...props }: ComponentProps<"a">) => (
    <a {...props}>{children}</a>
  ),
}))

vi.mock("motion/react", () => ({
  motion: {
    article: ({ children }: { children?: ReactNode }) => (
      <article>{children}</article>
    ),
    div: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  },
  useReducedMotion: () => true,
}))

import { ArticleCard } from "@/components/blog/article-card"
import { HomeDoorGrid } from "@/components/blog/home-door-grid"
import type { ArticleSummary } from "@/types/blog"

const article: ArticleSummary = {
  title: "A durable personal system",
  desc: "A short description for the archive card.",
  date: "2026-03-12",
  tags: ["BACKROOMS"],
  category: "世界观档案",
  cover: null,
  draft: false,
  slug: "durable-personal-system",
}

afterEach(() => {
  cleanup()
})

function classNames(element: Element | null | undefined) {
  return element?.className.split(/\s+/) ?? []
}

describe("article card spacing", () => {
  it("keeps the designation and category badge visibly separated", () => {
    render(<ArticleCard article={article} />)

    const categoryBadge = screen.getByRole("link", { name: "世界观档案" })

    expect(classNames(categoryBadge.parentElement)).toContain("gap-5")
  })

  it("keeps a visible gap between the home designation row and content panel", () => {
    render(<HomeDoorGrid articles={[article]} />)

    const archiveBadge = screen.getByText("Archive", { exact: true })
    const contentWrapper = archiveBadge.parentElement?.parentElement

    expect(classNames(contentWrapper)).toContain("gap-5")
  })
})
