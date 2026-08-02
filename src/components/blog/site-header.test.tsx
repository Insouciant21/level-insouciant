// @vitest-environment jsdom

import { render, screen } from "@testing-library/react"
import type { ComponentProps, ReactNode } from "react"
import { describe, expect, it, vi } from "vitest"

vi.mock("next/link", () => ({
  default: ({ children, ...props }: ComponentProps<"a">) => (
    <a {...props}>{children}</a>
  ),
}))

vi.mock("@/lib/auth", () => ({
  getCurrentUser: vi.fn(async () => null),
}))

vi.mock("@/lib/site", () => ({
  siteConfig: {
    name: "Level Insouciant",
    description: "记录现实、回声与失真的秩序",
    nav: [{ href: "/", label: "首页" }],
  },
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

describe("SiteHeader", () => {
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
