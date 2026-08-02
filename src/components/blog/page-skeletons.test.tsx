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
