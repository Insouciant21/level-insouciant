import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
  redirect: vi.fn((path: string): never => {
    throw new Error(`REDIRECT:${path}`)
  }),
  revalidatePath: vi.fn(),
  requireAdmin: vi.fn(),
  saveFaviconUpload: vi.fn(),
}))

vi.mock("next/navigation", () => ({
  redirect: mocks.redirect,
}))

vi.mock("next/cache", () => ({
  revalidatePath: mocks.revalidatePath,
}))

vi.mock("@/lib/auth", () => ({
  requireAdmin: mocks.requireAdmin,
}))

vi.mock("@/lib/favicon-assets", () => ({
  saveFaviconUpload: mocks.saveFaviconUpload,
}))

import { uploadFaviconAction } from "@/app/admin/favicon-actions"

function createForm(file?: File) {
  const formData = new FormData()

  if (file) {
    formData.set("favicon", file)
  }

  return formData
}

describe("admin favicon actions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.requireAdmin.mockResolvedValue({ id: "admin-1", role: "ADMIN" })
    mocks.saveFaviconUpload.mockResolvedValue(undefined)
  })

  it("does not read the upload when authorization redirects", async () => {
    mocks.requireAdmin.mockRejectedValue(new Error("REDIRECT:/admin/login"))

    await expect(
      uploadFaviconAction(createForm(new File(["png"], "icon.png")))
    ).rejects.toThrow("REDIRECT:/admin/login")
    expect(mocks.saveFaviconUpload).not.toHaveBeenCalled()
  })

  it("redirects a missing upload as invalid", async () => {
    await expect(uploadFaviconAction(createForm())).rejects.toThrow(
      "REDIRECT:/admin/settings?error=INVALID_FAVICON_UPLOAD"
    )
    expect(mocks.saveFaviconUpload).not.toHaveBeenCalled()
    expect(mocks.revalidatePath).not.toHaveBeenCalled()
  })

  it("saves the upload before revalidating the Admin settings route", async () => {
    const file = new File(["png"], "icon.png", { type: "image/png" })

    await expect(uploadFaviconAction(createForm(file))).rejects.toThrow(
      "REDIRECT:/admin/settings?notice=site-favicon-saved"
    )
    expect(mocks.saveFaviconUpload).toHaveBeenCalledWith(file)
    expect(mocks.revalidatePath).toHaveBeenNthCalledWith(1, "/", "layout")
    expect(mocks.revalidatePath).toHaveBeenNthCalledWith(2, "/admin/settings")
  })

  it("maps asset write failures to a stable error key", async () => {
    mocks.saveFaviconUpload.mockRejectedValue(new Error("disk full"))

    await expect(
      uploadFaviconAction(createForm(new File(["png"], "icon.png")))
    ).rejects.toThrow("REDIRECT:/admin/settings?error=FAVICON_SAVE_FAILED")
    expect(mocks.revalidatePath).not.toHaveBeenCalled()
  })
})
