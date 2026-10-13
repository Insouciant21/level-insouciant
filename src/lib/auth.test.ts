import { beforeEach, describe, expect, it, vi } from "vitest"
const mocks = vi.hoisted(() => ({ auth: vi.fn(), findUnique: vi.fn() }))
vi.mock("@/auth", () => ({ auth: mocks.auth }))
vi.mock("@/lib/prisma", () => ({
  prisma: { user: { findUnique: mocks.findUnique } },
}))
import { getCurrentUser, getCurrentAdmin } from "./auth"
beforeEach(() => {
  vi.stubEnv("DATABASE_URL", "postgresql://test/test")
  mocks.auth.mockResolvedValue({
    user: { id: "user-1", role: "ADMIN", email: "old@example.test" },
  })
  mocks.findUnique.mockReset()
})
describe("fresh authorization", () => {
  it("rejects a deleted user even if their JWT remains valid", async () => {
    mocks.findUnique.mockResolvedValue(null)
    expect(await getCurrentUser()).toBeNull()
  })
  it("rejects stale administrator privileges", async () => {
    mocks.findUnique.mockResolvedValue({
      id: "user-1",
      role: "USER",
      email: "new@example.test",
      name: "Reader",
      avatarUrl: null,
    })
    expect(await getCurrentAdmin()).toBeNull()
    expect(await getCurrentUser()).toMatchObject({
      email: "new@example.test",
      role: "USER",
    })
  })
  it("does not authorize when the database is unavailable", async () => {
    mocks.findUnique.mockRejectedValue(new Error("database unavailable"))
    await expect(getCurrentAdmin()).rejects.toThrow("database unavailable")
  })
})
