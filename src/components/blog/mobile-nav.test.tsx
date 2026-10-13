// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react"
import type { ComponentProps, ReactNode } from "react"
import { afterEach, describe, expect, it, vi } from "vitest"

vi.mock("@/lib/navigation", async (importOriginal) => ({
  ...await importOriginal<typeof import("@/lib/navigation")>(),
  default: ({ children, ...props }: ComponentProps<"a">) => (
    <a {...props}>{children}</a>
  ),
}))

vi.mock("@/lib/action-links", () => ({
  logoutAction: vi.fn(),
}))

vi.mock("@/components/ui/sheet", () => ({
  Sheet: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  SheetTrigger: ({ children }: { children?: ReactNode }) => <>{children}</>,
  SheetClose: ({ children }: { children?: ReactNode }) => <>{children}</>,
  SheetContent: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  SheetHeader: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  SheetTitle: ({ children }: { children?: ReactNode }) => <h2>{children}</h2>,
  SheetDescription: ({ children }: { children?: ReactNode }) => (
    <p>{children}</p>
  ),
}))

import { MobileNav } from "@/components/blog/mobile-nav"

const config = {
  name: "Custom Archive",
  nav: [{ href: "/", label: "首页" }],
}

afterEach(cleanup)

describe("MobileNav", () => {
  it("shows the signed-in user's configured avatar in the drawer", () => {
    render(
      <MobileNav
        user={{
          name: "Archive User",
          email: "user@example.com",
          image: " https://example.com/avatar.png ",
          role: "USER",
        }}
        config={config}
      />
    )

    const avatar = screen.getByTestId("mobile-nav-user-avatar")

    expect(avatar.style.backgroundImage).toContain(
      "https://example.com/avatar.png"
    )
    expect(avatar.querySelector(".lucide-user-round")).toBeNull()
  })

  it("keeps the user icon fallback when no avatar is configured", () => {
    render(
      <MobileNav
        user={{
          name: "Archive User",
          email: "user@example.com",
          image: null,
          role: "USER",
        }}
        config={config}
      />
    )

    const avatar = screen.getByTestId("mobile-nav-user-avatar")

    expect(avatar.style.backgroundImage).toBe("")
    expect(avatar.querySelector(".lucide-user-round")).not.toBeNull()
  })
})
