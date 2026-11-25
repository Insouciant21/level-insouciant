// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react"
import type { ComponentProps, ReactNode } from "react"
import { afterEach, describe, expect, it, vi } from "vitest"

vi.mock("@/lib/navigation", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/navigation")>()),
  default: ({ children, ...props }: ComponentProps<"a">) => (
    <a {...props}>{children}</a>
  ),
}))

vi.mock("motion/react", () => ({
  motion: {
    article: ({
      children,
      className,
    }: {
      children?: ReactNode
      className?: string
    }) => <article className={className}>{children}</article>,
    div: ({
      children,
      className,
    }: {
      children?: ReactNode
      className?: string
    }) => <div className={className}>{children}</div>,
  },
  useReducedMotion: () => true,
}))

import { ArticleCard } from "@/components/blog/article-card"
import { HomeDoorGrid } from "@/components/blog/home-door-grid"
import type { ArticleSummary } from "@/types/blog"

const article: ArticleSummary = {
  archiveCode: "A-0001",
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
  it("keeps the designation and category badge visibly separated and clickable above card link", () => {
    render(<ArticleCard article={article} />)

    const categoryBadge = screen.getByRole("link", { name: "世界观档案" })
    const tagLink = screen.getByRole("link", { name: "BACKROOMS" })
    const titleLink = screen.getByRole("link", { name: article.title })

    expect(classNames(categoryBadge.parentElement)).toContain("gap-3")
    expect(classNames(categoryBadge)).toContain("z-20")
    expect(classNames(tagLink.closest(".relative"))).toContain("z-20")
    expect(classNames(titleLink)).toContain("after:z-10")
  })

  it("fills the home grid row cleanly without orphan gaps for 6 articles", () => {
    const sixArticles = Array.from({ length: 6 }, (_, index) => ({
      ...article,
      archiveCode: `A-000${index + 1}`,
      slug: `entry-${index + 1}`,
      title: `Entry ${index + 1}`,
    }))

    render(<HomeDoorGrid articles={sixArticles} />)

    const deadEndLink = screen.getByRole("link", { name: /进入完整档案室/ })
    expect(classNames(deadEndLink.parentElement)).toContain("lg:col-span-4")
  })

  it("balances the 2-article home grid without leaving an empty top-right cell", () => {
    const twoArticles = [
      article,
      {
        ...article,
        archiveCode: "A-0002",
        slug: "second-entry",
        title: "Second Entry",
      },
    ]

    render(<HomeDoorGrid articles={twoArticles} />)

    const secondCard = screen
      .getByRole("heading", { name: "Second Entry" })
      .closest("article")

    expect(classNames(secondCard)).toContain("lg:col-span-2")
  })

  it("keeps a visible gap between the home designation row and content panel", () => {
    render(<HomeDoorGrid articles={[article]} />)

    const archiveBadge = screen.getByText("Archive", { exact: true })
    const contentWrapper = archiveBadge.parentElement?.parentElement

    expect(classNames(contentWrapper)).toContain("gap-3")
  })

  it("uses compact title sizing for long home card titles", () => {
    const longTitle = "用极简约束搭建长期可维护的个人系统"

    render(<HomeDoorGrid articles={[{ ...article, title: longTitle }]} />)

    const heading = screen.getByRole("heading", { name: longTitle })

    expect(classNames(heading)).toContain("lg:text-4xl")
    expect(classNames(heading)).not.toContain("lg:text-5xl")
  })
})
