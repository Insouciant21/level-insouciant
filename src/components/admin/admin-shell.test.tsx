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
      <AdminShell userName="Admin User" siteName="Custom Archive">
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

    const articleLink = within(mobileSheet).getByRole("link", {
      name: /文章内容管理/,
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
})
