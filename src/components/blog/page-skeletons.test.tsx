// @vitest-environment jsdom

import type { ReactElement } from "react"

import { cleanup, render } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"

import {
  AccountPageSkeleton,
  ArchiveDetailPageSkeleton,
  ArchiveDirectoryPageSkeleton,
  ArticlePageSkeleton,
  ArticlesPageSkeleton,
  AuthPageSkeleton,
  HomePageSkeleton,
  SearchPageSkeleton,
  TagsPageSkeleton,
} from "@/components/blog/page-skeletons"

afterEach(() => {
  cleanup()
})

describe("public page skeleton compositions", () => {
  it("keeps home loading geometry in hero, archive grid, article grid, and support panels", () => {
    const { container } = render(<HomePageSkeleton />)

    expect(
      container.querySelector('[data-skeleton-layout="home"]')
    ).not.toBeNull()
    expect(
      container.querySelectorAll('[aria-hidden="true"]').length
    ).toBeGreaterThan(20)
  })

  it("keeps home static copy visible while dynamic records load", () => {
    const { container } = render(<HomePageSkeleton />)
    const staticCopy = [
      "Archive Signal",
      "Loading archive",
      "Configured archive details are loading.",
      "Primary entry",
      "Secondary entry",
      "Facility Hub // Entry Node",
      "分叉走廊",
      "Archive",
      "Observation Log",
      "观测日志",
      "Index",
      "关键词索引",
      "Custodian Note",
      "Custodian profile",
      "Pending",
      "Configured profile details are loading.",
      "Location pending",
      "Contact pending",
    ]

    for (const text of staticCopy) {
      const visibleNode = Array.from(
        container.querySelectorAll("h1, h2, p, span")
      ).find(
        (node) =>
          node.textContent?.trim() === text &&
          !node.closest('[aria-hidden="true"]')
      )

      expect(visibleNode, `Expected visible home copy: ${text}`).toBeDefined()
    }

    expect(
      container.querySelectorAll('[aria-hidden="true"]').length
    ).toBeGreaterThan(20)
    expect(container.textContent).not.toContain("挑一扇门，继续向里走")
  })

  it("does not render fallback identity or contact data while home loads", () => {
    const { container } = render(<HomePageSkeleton />)

    expect(container.textContent).not.toContain("Level Insouciant")
    expect(container.textContent).not.toContain("insouciant21@outlook.com")
    expect(container.textContent).toContain("Facility Hub // Entry Node")
  })

  it("removes the latest archive section from the home loading state", () => {
    const { container } = render(<HomePageSkeleton />)

    expect(container.textContent).not.toContain("最新档案")
    expect(container.textContent).not.toContain("查看全部档案")
  })

  it("keeps article loading geometry in document, TOC, engagement, and related regions", () => {
    const { container } = render(<ArticlePageSkeleton />)

    expect(
      container.querySelector('[data-skeleton-layout="article"]')
    ).not.toBeNull()
    expect(
      container.querySelectorAll('[aria-hidden="true"]').length
    ).toBeGreaterThan(20)
    expect(container.querySelector(".max-w-\\[1200px\\]")).not.toBeNull()
  })

  it("keeps the archive intro copy visible while the records load", () => {
    const { container } = render(<ArticlesPageSkeleton />)
    const intro = container.querySelector(".site-section-header")

    expect(intro?.querySelector("[aria-hidden=\"true\"]")).toBeNull()
    expect(intro?.querySelector("h1")?.textContent).toBe("层级档案")
    expect(intro?.querySelector("p")?.textContent).toBe("Archive")
    expect(intro?.querySelectorAll("p")).toHaveLength(1)
    expect(intro?.textContent).not.toContain(
      "所有公开记录都按照统一元数据整理，方便沿关键词、分类和时间线继续向深处下潜。"
    )
  })

  it.each([
    ["categories", <ArchiveDirectoryPageSkeleton key="categories" />, "Categories", "分类归档"],
    ["tags", <TagsPageSkeleton key="tags" />, "Tags", "标签归档"],
  ] satisfies [string, ReactElement, string, string][]) (
    "%s intro title stays visible while data loads",
    (_, skeleton, eyebrow, title) => {
      const { container } = render(skeleton)
      const intro = container.querySelector(".site-section-header")

      expect(intro?.querySelector("[aria-hidden=\"true\"]")).toBeNull()
      expect(intro?.querySelector("h1")?.textContent).toBe(title)
      expect(intro?.querySelector("p")?.textContent).toBe(eyebrow)
      expect(intro?.querySelectorAll("p")).toHaveLength(1)
      expect(container.querySelector('[aria-hidden="true"]')).not.toBeNull()
    }
  )

  it.each([
    ["articles", <ArticlesPageSkeleton key="articles" />],
    [
      "archive directory",
      <ArchiveDirectoryPageSkeleton key="archive-directory" />,
    ],
    ["archive detail", <ArchiveDetailPageSkeleton key="archive-detail" />],
    ["tags", <TagsPageSkeleton key="tags" />],
    ["search", <SearchPageSkeleton key="search" />],
    ["auth", <AuthPageSkeleton key="auth" />],
    ["account", <AccountPageSkeleton key="account" />],
  ] satisfies [string, ReactElement][])(
    "%s loading contains hidden placeholders",
    (_, skeleton) => {
      const { container } = render(skeleton)

      expect(container.querySelector('[aria-hidden="true"]')).not.toBeNull()
    }
  )
})
