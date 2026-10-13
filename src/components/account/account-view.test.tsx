// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import type { AccountProfile } from "@/lib/account"

vi.mock("@/lib/action-links", () => ({
  changePasswordAction: vi.fn(),
  deleteOwnCommentAction: vi.fn(),
  updateProfileAction: vi.fn(),
}))

import { AdminAccountView } from "@/components/account/account-view"

afterEach(cleanup)

const profile = {
  id: "admin-1",
  email: "admin@example.test",
  name: "Admin",
  avatarUrl: null,
  role: "ADMIN",
  createdAt: "2026-08-04T00:00:00.000Z",
} satisfies AccountProfile

describe("AdminAccountView", () => {
  it("keeps the account header focused on identity and status", () => {
    render(<AdminAccountView profile={profile} comments={[]} notice={null} />)

    expect(screen.getByRole("heading", { name: "我的资料" })).toBeTruthy()
    expect(screen.getByText("管理员会话")).toBeTruthy()
    expect(
      screen.queryByText(
        "管理管理员账号资料、密码，以及你在站内留下的评论记录。"
      )
    ).toBeNull()
  })
})
