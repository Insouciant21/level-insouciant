// @vitest-environment jsdom

import type { ReactNode } from "react"
import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

vi.mock("@/components/motion/page-transition", () => ({
  MotionReveal: ({
    children,
    variant,
  }: {
    children: ReactNode
    variant?: string
  }) => (
    <div data-testid="admin-motion-reveal" data-variant={variant}>
      {children}
    </div>
  ),
}))

import AdminProtectedTemplate from "@/components/admin/admin-page-transition"

describe("AdminProtectedTemplate", () => {
  it("wraps protected content in the terminal page transition", () => {
    render(
      <AdminProtectedTemplate>
        <p>Admin content</p>
      </AdminProtectedTemplate>
    )

    expect(
      screen.getByTestId("admin-motion-reveal").getAttribute("data-variant")
    ).toBe("terminal")
    expect(screen.getByText("Admin content")).toBeTruthy()
  })
})
