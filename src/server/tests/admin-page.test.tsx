// @vitest-environment jsdom

import type { ComponentProps } from "react"

import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

vi.mock("@/lib/navigation", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/navigation")>()),
  default: ({ children, ...props }: ComponentProps<"a">) => (
    <a {...props}>{children}</a>
  ),
}))

import AdminEntryPage from "@/views/admin-index"

afterEach(cleanup)

describe("AdminEntryPage", () => {
  it("keeps the routing fallback focused on the entry action", () => {
    render(<AdminEntryPage location="/admin" />)

    expect(screen.getByRole("heading", { name: "正在进入后台" })).toBeTruthy()
    expect(
      screen.queryByText(
        "正常情况下，这个入口会在请求阶段自动跳转。若你当前仍停在这里，可以直接前往后台登录页。"
      )
    ).toBeNull()
    expect(screen.getByRole("link", { name: "前往 /admin/login" })).toBeTruthy()
  })
})
