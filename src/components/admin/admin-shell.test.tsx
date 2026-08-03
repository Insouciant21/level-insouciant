// @vitest-environment jsdom

import { cleanup, render, screen, within } from "@testing-library/react"
import type { ComponentProps, ReactNode } from "react"
import { afterEach, describe, expect, it, vi } from "vitest"

vi.mock("next/navigation", () => ({
  usePathname: () => "/admin/articles",
}))

vi.mock("next/link", () => ({
  default: ({ children, ...props }: ComponentProps<"a">) => (
    <a {...props}>{children}</a>
  ),
}))

vi.mock("@/app/actions/auth", () => ({
  logoutAction: vi.fn(),
}))

vi.mock("@/components/ui/perfect-scrollbar", () => ({
  PerfectScrollbar: ({ children }: { children?: ReactNode }) => (
    <div>{children}</div>
  ),
}))

vi.mock("@/components/ui/sheet", () => ({
  Sheet: ({ children }: { children?: ReactNode }) => (
    <div data-testid="admin-mobile-sheet">{children}</div>
  ),
  SheetTrigger: ({ children }: { children?: ReactNode }) => <>{children}</>,
  SheetClose: ({ children }: { children?: ReactNode }) => (
    <div data-sheet-close="true">{children}</div>
  ),
  SheetContent: ({ children }: { children?: ReactNode }) => (
    <div data-testid="admin-mobile-sheet-content">{children}</div>
  ),
  SheetHeader: ({ children }: { children?: ReactNode }) => (
    <div>{children}</div>
  ),
  SheetTitle: ({ children }: { children?: ReactNode }) => (
    <h2>{children}</h2>
  ),
  SheetDescription: ({ children }: { children?: ReactNode }) => (
    <p>{children}</p>
  ),
}))

import { AdminShell } from "@/components/admin/admin-shell"

afterEach(() => {
  cleanup()
})

describe("AdminShell mobile navigation", () => {
  it("renders the mobile sheet and closes navigation destinations", () => {
    render(
      <AdminShell
        userName="Admin User"
        userImage="https://example.com/admin-avatar.png"
        siteIconUrl="/site-icons/icon-32.png?v=test"
        siteName="Custom Archive"
      >
        <p>Admin content</p>
      </AdminShell>
    )

    const mobileSheet = screen.getByTestId("admin-mobile-sheet")

    expect(
      within(mobileSheet).getByRole("button", { name: "打开后台导航" })
    ).toBeTruthy()
    expect(
      within(mobileSheet).getByRole("heading", { name: "管理控制台" })
    ).toBeTruthy()
    expect(screen.getAllByText("Custom Archive")).toHaveLength(2)
    expect(screen.getAllByTestId("admin-site-icon")).toHaveLength(2)
    expect(screen.getAllByTestId("admin-site-icon")[0].style.backgroundImage).toContain(
      "/site-icons/icon-32.png?v=test"
    )
    expect(screen.getAllByTestId("admin-user-avatar")).toHaveLength(2)
    expect(screen.getAllByTestId("admin-user-avatar")[0].style.backgroundImage).toContain(
      "https://example.com/admin-avatar.png"
    )
    expect(screen.queryByText("运营总览")).toBeNull()
    expect(screen.queryByText("内容管理")).toBeNull()

    const articleLink = within(mobileSheet).getByRole("link", {
      name: "文章",
    })
    const siteLink = within(mobileSheet).getByRole("link", {
      name: "查看站点",
    })
    const logoutButton = within(mobileSheet).getByRole("button", {
      name: "退出登录",
    })

    expect(articleLink.closest("[data-sheet-close]")).not.toBeNull()
    expect(siteLink.closest("[data-sheet-close]")).not.toBeNull()
    expect(logoutButton.closest("[data-sheet-close]")).not.toBeNull()
  })

  it("falls back to the user's initial when no avatar is configured", () => {
    render(
      <AdminShell
        siteIconUrl="/site-icons/icon-32.png?v=test"
        userName="Admin User"
        siteName="Custom Archive"
      >
        <p>Admin content</p>
      </AdminShell>
    )

    expect(screen.getAllByTestId("admin-user-avatar")).toHaveLength(2)
    expect(
      screen
        .getAllByTestId("admin-user-avatar")
        .every((avatar) => avatar.textContent === "A")
    ).toBe(true)
  })
})
