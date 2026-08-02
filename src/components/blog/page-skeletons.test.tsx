// @vitest-environment jsdom

import type { ReactElement } from "react"

import { cleanup, render } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"

import {
  AboutPageSkeleton,
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
    expect(intro?.textContent).toContain(
      "所有公开记录都按照统一元数据整理，方便沿关键词、分类和时间线继续向深处下潜。"
    )
  })

  it.each([
    [
      "categories",
      <ArchiveDirectoryPageSkeleton key="categories" />,
      "Categories",
      "分类归档",
      "分类回答内容属于什么方向，和标签一起构成博客的双层归档结构。",
    ],
    [
      "tags",
      <TagsPageSkeleton key="tags" />,
      "Tags",
      "标签归档",
      "标签用于组织主题维度。这里既能快速总览全部主题，也能直接下钻到每个标签下的文章集合。",
    ],
  ] satisfies [string, ReactElement, string, string, string][]) (
    "%s intro copy stays visible while data loads",
    (_, skeleton, eyebrow, title, description) => {
      const { container } = render(skeleton)
      const intro = container.querySelector(".site-section-header")

      expect(intro?.querySelector("[aria-hidden=\"true\"]")).toBeNull()
      expect(intro?.querySelector("h1")?.textContent).toBe(title)
      expect(intro?.querySelector("p")?.textContent).toBe(eyebrow)
      expect(intro?.textContent).toContain(description)
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
    ["about", <AboutPageSkeleton key="about" />],
  ] satisfies [string, ReactElement][])(
    "%s loading contains hidden placeholders",
    (_, skeleton) => {
      const { container } = render(skeleton)

      expect(container.querySelector('[aria-hidden="true"]')).not.toBeNull()
    }
  )
})
