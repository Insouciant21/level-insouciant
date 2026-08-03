// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react"
import type { ComponentProps, ReactNode } from "react"
import { afterEach, describe, expect, it, vi } from "vitest"

vi.mock("next/link", () => ({
  default: ({ children, ...props }: ComponentProps<"a">) => (
    <a {...props}>{children}</a>
  ),
}))

vi.mock("@/lib/auth", () => ({
  getCurrentUser: vi.fn(async () => null),
}))

vi.mock("@/lib/site-config", () => ({
  getSiteConfig: vi.fn(async () => ({
    name: "Custom Archive",
    description: "Configured archive description",
    nav: [{ href: "/", label: "首页" }],
  })),
}))

vi.mock("@/components/blog/mobile-nav", () => ({
  MobileNav: () => <button type="button">打开导航</button>,
}))

vi.mock("@/components/blog/user-menu", () => ({
  UserMenu: ({ children }: { children?: ReactNode }) => (
    <button type="button">{children ?? "账户"}</button>
  ),
}))

import { SiteHeader } from "@/components/blog/site-header"

afterEach(() => {
  cleanup()
})

describe("SiteHeader", () => {
  it("renders the resolved configured site name", async () => {
    render(await SiteHeader())

    expect(screen.getByText("Custom Archive", { exact: true })).toBeTruthy()
  })

  it("uses the same translucent public surface language as the page", async () => {
    render(await SiteHeader())

    const header = document.querySelector("header")
    const status = screen.getByText("Archive Sync", { exact: true })

    expect(header?.className).toContain("site-header-shell")
    expect(header?.className).toContain("backdrop-blur-sm")
    expect(header?.className).not.toContain("bg-background/92")
    expect(status.className).toContain("site-status-pill")
  })
})
