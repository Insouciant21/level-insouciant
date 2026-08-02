// @vitest-environment jsdom

import type { ReactElement } from "react"

import { cleanup, render } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"

import {
  AdminAccountPageSkeleton,
  AdminArticleEditorPageSkeleton,
  AdminArticleHistoryPageSkeleton,
  AdminArticlesPageSkeleton,
  AdminCommentsPageSkeleton,
  AdminDashboardPageSkeleton,
  AdminLoginPageSkeleton,
  AdminProtectedPageSkeleton,
  AdminStatsPageSkeleton,
  AdminTagsPageSkeleton,
} from "@/components/admin/admin-page-skeletons"

afterEach(() => {
  cleanup()
})

describe("admin page skeleton compositions", () => {
  it("keeps login loading geometry in a split auth panel", () => {
    const { container } = render(<AdminLoginPageSkeleton />)

    expect(
      container.querySelector('[data-skeleton-layout="admin-login"]')
    ).not.toBeNull()
    expect(container.querySelector(".admin-auth-panel")).not.toBeNull()
    expect(
      container.querySelectorAll('[aria-hidden="true"]').length
    ).toBeGreaterThan(8)
  })

  it("keeps dashboard loading geometry in header, metrics, split content, and secondary metrics", () => {
    const { container } = render(<AdminDashboardPageSkeleton />)

    expect(
      container.querySelector('[data-skeleton-layout="admin-dashboard"]')
    ).not.toBeNull()
    expect(
      container.querySelectorAll('[aria-hidden="true"]').length
    ).toBeGreaterThan(20)
  })

  it("keeps list and table loading geometry aligned to admin content widths", () => {
    const { container: articles } = render(<AdminArticlesPageSkeleton />)
    const { container: stats } = render(<AdminStatsPageSkeleton />)

    expect(
      articles.querySelector('[data-skeleton-layout="admin-articles"]')
    ).not.toBeNull()
    expect(
      stats.querySelector('[data-skeleton-layout="admin-stats"]')
    ).not.toBeNull()
    expect(stats.querySelector(".overflow-x-auto")).not.toBeNull()
    expect(stats.querySelector("table.min-w-\\[760px\\]")).not.toBeNull()
  })

  it("keeps editor loading geometry in a desktop split with a stable multiline field", () => {
    const { container } = render(<AdminArticleEditorPageSkeleton />)

    expect(
      container.querySelector('[data-skeleton-layout="admin-editor"]')
    ).not.toBeNull()
    expect(
      container.querySelector(
        ".xl\\:grid-cols-\\[minmax\\(0\\,1fr\\)_minmax\\(0\\,1fr\\)\\]"
      )
    ).not.toBeNull()
    const largeField = container.querySelector(".min-h-\\[24rem\\]")
    expect(largeField).not.toBeNull()
    expect(
      Array.from(
        largeField?.querySelectorAll('[aria-hidden="true"]') ?? []
      ).some((node) => node.className.includes("min-h-[24rem]"))
    ).toBe(true)
  })

  it.each([
    ["protected", <AdminProtectedPageSkeleton key="protected" />],
    ["articles", <AdminArticlesPageSkeleton key="articles" />],
    ["comments", <AdminCommentsPageSkeleton key="comments" />],
    ["tags", <AdminTagsPageSkeleton key="tags" />],
    ["stats", <AdminStatsPageSkeleton key="stats" />],
    ["account", <AdminAccountPageSkeleton key="account" />],
    ["editor", <AdminArticleEditorPageSkeleton key="editor" />],
    ["history", <AdminArticleHistoryPageSkeleton key="history" />],
  ] satisfies [string, ReactElement][])(
    "%s loading contains hidden placeholders",
    (_, skeleton) => {
      const { container } = render(skeleton)

      expect(container.querySelector('[aria-hidden="true"]')).not.toBeNull()
    }
  )
})
