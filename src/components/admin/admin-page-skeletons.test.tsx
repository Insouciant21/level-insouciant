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
  AdminSettingsPageSkeleton,
  AdminStatsPageSkeleton,
  AdminTagsPageSkeleton,
} from "@/components/admin/admin-page-skeletons"

afterEach(() => {
  cleanup()
})

function expectVisibleAdminCopy(container: HTMLElement, text: string) {
  const node = Array.from(
    container.querySelectorAll("h1, h2, p, span, label, th")
  ).find(
    (candidate) =>
      candidate.textContent?.trim() === text &&
      !candidate.closest('[aria-hidden="true"]')
  )

  expect(node, `Expected visible admin copy: ${text}`).toBeDefined()
}

describe("admin page skeleton compositions", () => {
  it("keeps login loading geometry in a split auth panel", () => {
    const { container } = render(<AdminLoginPageSkeleton />)

    expect(
      container.querySelector('[data-skeleton-layout="admin-login"]')
    ).not.toBeNull()
    expect(container.querySelector(".admin-auth-panel")).not.toBeNull()
    expect(
      container.querySelectorAll('[aria-hidden="true"]').length
    ).toBeGreaterThan(4)
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

  it("keeps login copy visible while form controls load", () => {
    const { container } = render(<AdminLoginPageSkeleton />)

    for (const text of [
      "Admin Access",
      "登录后台控制台",
      "管理员登录",
      "邮箱",
      "密码",
      "进入控制台",
    ]) {
      expectVisibleAdminCopy(container, text)
    }

    expect(
      container.querySelectorAll('[aria-hidden="true"]').length
    ).toBeGreaterThan(4)
  })

  it("keeps dashboard labels and panel titles visible while metrics load", () => {
    const { container } = render(<AdminDashboardPageSkeleton />)

    for (const text of [
      "Operations Console",
      "后台概览",
      "系统正常",
      "已发布文章",
      "草稿文章",
      "全部阅读量",
      "全部评论数",
      "Draft Queue",
      "草稿队列",
      "Top Content",
      "热门文章",
      "标签主题",
      "累计点赞",
      "账号数",
    ]) {
      expectVisibleAdminCopy(container, text)
    }
  })

  it("keeps list, account, editor, and table labels visible while records load", () => {
    const pages = [
      {
        container: render(<AdminArticlesPageSkeleton />).container,
        texts: ["Article Control", "草稿与文章管理", "新建文章"],
      },
      {
        container: render(<AdminCommentsPageSkeleton />).container,
        texts: ["Comment Moderation", "评论管理"],
      },
      {
        container: render(<AdminTagsPageSkeleton />).container,
        texts: ["Tag Operations", "标签管理", "重命名", "从所有文章中移除"],
      },
      {
        container: render(<AdminStatsPageSkeleton />).container,
        texts: [
          "Article Analytics",
          "文章统计",
          "文章",
          "状态",
          "发布时间",
          "阅读",
          "点赞",
          "公开评论",
          "隐藏评论",
        ],
      },
      {
        container: render(<AdminAccountPageSkeleton />).container,
        texts: [
          "Account Console",
          "我的资料",
          "管理员会话",
          "Profile",
          "基本信息",
          "Security",
          "修改密码",
          "My Comments",
          "我的评论",
          "保存资料",
          "更新密码",
        ],
      },
      {
        container: render(<AdminSettingsPageSkeleton />).container,
        texts: ["Site Settings", "站点设置"],
      },
      {
        container: render(<AdminArticleEditorPageSkeleton />).container,
        texts: [
          "Edit Article",
          "在线编辑文章",
          "标题",
          "Slug",
          "摘要",
          "分类",
          "发布日期",
          "标签",
          "封面（可选）",
          "正文 MDX",
          "Live Preview",
          "实时预览",
          "保存草稿",
          "发布更新",
        ],
      },
      {
        container: render(<AdminArticleHistoryPageSkeleton />).container,
        texts: ["Revision History", "返回编辑页", "恢复这个版本"],
      },
    ]

    for (const page of pages) {
      for (const text of page.texts) {
        expectVisibleAdminCopy(page.container, text)
      }
      expect(
        page.container.querySelector('[aria-hidden="true"]')
      ).not.toBeNull()
    }
  })

  it("uses the route-known title for new article loading", () => {
    const { container } = render(
      <AdminArticleEditorPageSkeleton mode="create" />
    )

    expectVisibleAdminCopy(container, "New Article")
    expectVisibleAdminCopy(container, "新建文章")
    expect(container.querySelector('[aria-hidden="true"]')).not.toBeNull()
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

  it("uses the settings loading layout contract", () => {
    const { container } = render(<AdminSettingsPageSkeleton />)

    expect(
      container.querySelector('[data-skeleton-layout="admin-settings"]')
    ).not.toBeNull()
  })

  it.each([
    ["protected", <AdminProtectedPageSkeleton key="protected" />],
    ["articles", <AdminArticlesPageSkeleton key="articles" />],
    ["comments", <AdminCommentsPageSkeleton key="comments" />],
    ["tags", <AdminTagsPageSkeleton key="tags" />],
    ["stats", <AdminStatsPageSkeleton key="stats" />],
    ["account", <AdminAccountPageSkeleton key="account" />],
    ["settings", <AdminSettingsPageSkeleton key="settings" />],
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
