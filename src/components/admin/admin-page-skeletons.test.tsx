// @vitest-environment jsdom

import type { ReactElement } from "react"

import { cleanup, render } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { AdminAccountView } from "@/components/account/account-view"
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

vi.mock("@/app/account/actions", () => ({
  changePasswordAction: vi.fn(),
  deleteOwnCommentAction: vi.fn(),
  updateProfileAction: vi.fn(),
}))

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

  it("keeps top-level loading kickers green", () => {
    const pages = [
      <AdminDashboardPageSkeleton key="dashboard" />,
      <AdminArticlesPageSkeleton key="articles" />,
      <AdminCommentsPageSkeleton key="comments" />,
      <AdminTagsPageSkeleton key="tags" />,
      <AdminStatsPageSkeleton key="stats" />,
      <AdminAccountPageSkeleton key="account" />,
      <AdminSettingsPageSkeleton key="settings" />,
      <AdminArticleEditorPageSkeleton key="editor" />,
      <AdminArticleHistoryPageSkeleton key="history" />,
    ]

    for (const page of pages) {
      const { container } = render(page)
      const topLevelKicker = container.querySelector(
        '[data-admin-skeleton-kicker="top-level"]'
      )

      expect(topLevelKicker?.className).toContain("admin-kicker-accent")
    }
  })

  it("matches dashboard metric card geometry", () => {
    const { container } = render(<AdminDashboardPageSkeleton />)
    const cards = container.querySelectorAll("[data-skeleton-metric-card]")

    expect(cards).toHaveLength(7)

    for (const card of cards) {
      expect(
        card.querySelector("[data-skeleton-metric-icon]")?.className
      ).toContain("size-8")
      expect(
        card.querySelector("[data-skeleton-metric-value]")?.className
      ).toContain("h-9")
      expect(
        card.querySelector("[data-skeleton-metric-hint]")?.className
      ).toContain("mt-2")
    }
  })

  it("uses page-specific header geometry", () => {
    const { container: dashboard } = render(<AdminDashboardPageSkeleton />)
    const dashboardHeader = dashboard.querySelector(
      '[data-admin-skeleton-header="dashboard"]'
    )

    expect(dashboardHeader?.className).toContain("pb-6")
    expect(dashboardHeader?.querySelector("h1")?.className).toContain(
      "text-3xl"
    )

    const { container: articles } = render(<AdminArticlesPageSkeleton />)
    const standardHeader = articles.querySelector(
      '[data-admin-skeleton-header="standard"]'
    )

    expect(standardHeader?.className).not.toContain("border-b")
    expect(
      standardHeader?.querySelector("[data-admin-skeleton-header-content]")
        ?.className
    ).toContain("gap-2")
    expect(standardHeader?.querySelector("h1")?.className).not.toContain("mt-3")

    const { container: account } = render(<AdminAccountPageSkeleton />)
    const accountHeader = account.querySelector(
      '[data-admin-skeleton-header="account"]'
    )

    expect(accountHeader?.className).toContain("pb-5")
    expect(accountHeader?.querySelector("h1")?.className).toContain("text-3xl")
  })

  it("matches the real form control heights", () => {
    const { container } = render(<AdminArticleEditorPageSkeleton />)
    const controls = Array.from(
      container.querySelectorAll(
        "[data-skeleton-editor-field] > [data-skeleton-tone]"
      )
    )

    expect(controls.length).toBeGreaterThan(0)
    expect(controls.some((control) => control.className.includes("h-24"))).toBe(
      true
    )
    expect(controls.some((control) => control.className.includes("h-10"))).toBe(
      true
    )

    const { container: settings } = render(<AdminSettingsPageSkeleton />)
    expect(settings.querySelector("header.admin-surface")).not.toBeNull()
    expect(
      settings.querySelector(".site-settings-form.admin-surface")
    ).not.toBeNull()
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
          "Article Metadata",
          "文章元数据",
          "标题",
          "Slug",
          "摘要",
          "分类",
          "发布日期",
          "标签",
          "封面（可选）",
          "MDX Source",
          "MDX 源码",
          "Live Preview",
          "实时效果",
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

  it("keeps the article editor skeleton aligned to the metadata and workbench layout", () => {
    const { container } = render(<AdminArticleEditorPageSkeleton />)

    expect(
      container.querySelector('[data-editor-section="metadata"]')
    ).not.toBeNull()
    expect(container.querySelector("[data-editor-workbench]")).not.toBeNull()
    expect(
      container.querySelector('[data-editor-panel="source"]')
    ).not.toBeNull()
    expect(
      container.querySelector('[data-editor-panel="preview"]')
    ).not.toBeNull()
    expectVisibleAdminCopy(container, "MDX 源码")
    expectVisibleAdminCopy(container, "实时效果")
    expect(container.textContent).not.toContain(
      "使用结构化字段加原始 MDX 正文编辑，保存即生成修订记录。"
    )

    const metadata = container.querySelector('[data-editor-section="metadata"]')

    expect(metadata?.className).not.toContain("border-y")
    expect(metadata?.className).toContain("border-b")
    expect(metadata?.className).not.toContain("mt-6")
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

  it("keeps editor loading geometry in a desktop split with stable panel heights", () => {
    const { container } = render(<AdminArticleEditorPageSkeleton />)

    expect(
      container.querySelector('[data-skeleton-layout="admin-editor"]')
    ).not.toBeNull()
    expect(container.querySelector("[data-editor-workbench]")).not.toBeNull()
    expect(
      container.querySelector('[data-editor-panel="source"]')
    ).not.toBeNull()
    expect(
      container.querySelector('[data-editor-panel="preview"]')
    ).not.toBeNull()
    expect(container.querySelector(".h-\\[32rem\\]")).not.toBeNull()
  })

  it("uses the settings loading layout contract", () => {
    const { container } = render(<AdminSettingsPageSkeleton />)

    expect(
      container.querySelector('[data-skeleton-layout="admin-settings"]')
    ).not.toBeNull()
  })

  it("does not render page-level descriptions in admin loading states", () => {
    const cases = [
      [
        <AdminLoginPageSkeleton key="login" />,
        "管理文章、评论和站点内容，所有操作都会保留在后台记录中。",
      ],
      [
        <AdminDashboardPageSkeleton key="dashboard" />,
        "这里汇总公开记录、草稿、互动数据和用户规模",
      ],
      [<AdminProtectedPageSkeleton key="protected" />, "正在载入后台内容。"],
      [
        <AdminArticlesPageSkeleton key="articles" />,
        "这里直接操作数据库中的文章记录，可以新建、编辑、发布、下线、查看修订历史或删除文章。",
      ],
      [
        <AdminCommentsPageSkeleton key="comments" />,
        "可以隐藏、恢复或删除评论。对某条评论执行操作时，会同步作用到它下面的所有楼中楼回复。",
      ],
      [
        <AdminTagsPageSkeleton key="tags" />,
        "标签现在来自数据库中的文章记录。这里支持批量重命名标签，或者从所有文章里移除某个标签。",
      ],
      [
        <AdminStatsPageSkeleton key="stats" />,
        "按文章维度聚合阅读、点赞和评论表现，方便快速判断哪些内容在工作。",
      ],
      [
        <AdminAccountPageSkeleton key="account" />,
        "管理管理员账号资料、密码，以及你在站内留下的评论记录。",
      ],
      [
        <AdminArticleEditorPageSkeleton key="editor-create" mode="create" />,
        "创建后会立刻写入数据库并生成第一条修订记录。",
      ],
      [
        <AdminArticleEditorPageSkeleton key="editor-edit" mode="edit" />,
        "每次保存都会生成修订记录，便于后续回滚。",
      ],
      [
        <AdminArticleHistoryPageSkeleton key="history" />,
        "这里会保存每一次创建、编辑、发布、隐藏、标签变更和版本恢复后的快照。",
      ],
    ] as const

    for (const [skeleton, description] of cases) {
      const { container } = render(skeleton)
      expect(container.textContent).not.toContain(description)
    }

    const { container } = render(<AdminSettingsPageSkeleton />)
    expect(container.textContent).not.toContain("页脚结束语")
    expect(
      Array.from(container.querySelectorAll("label")).some(
        (label) => label.textContent?.trim() === "描述"
      )
    ).toBe(false)
  })

  it("removes the admin account header description", () => {
    const { container } = render(
      <AdminAccountView
        profile={{
          id: "admin-1",
          email: "admin@example.test",
          name: "Admin",
          avatarUrl: null,
          role: "ADMIN",
          createdAt: "2026-08-04T00:00:00.000Z",
        }}
        comments={[]}
        notice={null}
      />
    )

    expect(container.textContent).not.toContain(
      "管理管理员账号资料、密码，以及你在站内留下的评论记录。"
    )
    expect(container.querySelector("h1")?.textContent).toBe("我的资料")
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
