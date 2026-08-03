import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
  redirect: vi.fn((path: string): never => {
    throw new Error(`REDIRECT:${path}`)
  }),
  revalidatePath: vi.fn(),
  requireAdmin: vi.fn(),
  saveSiteConfig: vi.fn(),
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

vi.mock("@/lib/site-config", () => ({
  saveSiteConfig: mocks.saveSiteConfig,
}))

import { defaultSiteConfig, type SiteConfigData } from "@/lib/site"
import {
  parseSiteSettingsFormData,
  updateSiteSettingsAction,
} from "@/app/admin/settings-actions"

const siteSettingsData = Object.fromEntries(
  Object.entries(defaultSiteConfig).filter(
    ([key]) => !["language", "locale", "nav", "socials"].includes(key)
  )
) as SiteConfigData

function createSettingsForm(value: unknown) {
  const formData = new FormData()
  formData.set("settings", JSON.stringify(value))
  return formData
}

describe("admin site settings actions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.requireAdmin.mockResolvedValue({ id: "admin-1", role: "ADMIN" })
    mocks.saveSiteConfig.mockResolvedValue(undefined)
  })

  it("parses the JSON settings form field into site config data", () => {
    expect(parseSiteSettingsFormData(createSettingsForm(defaultSiteConfig))).toEqual(
      siteSettingsData
    )
  })

  it("redirects malformed JSON as invalid site settings", async () => {
    const formData = new FormData()
    formData.set("settings", "{")

    await expect(updateSiteSettingsAction(formData)).rejects.toThrow(
      "REDIRECT:/admin/settings?error=INVALID_SITE_SETTINGS"
    )
    expect(mocks.saveSiteConfig).not.toHaveBeenCalled()
    expect(mocks.revalidatePath).not.toHaveBeenCalled()
  })

  it("redirects schema failures as invalid site settings", async () => {
    await expect(
      updateSiteSettingsAction(createSettingsForm({ name: "" }))
    ).rejects.toThrow("REDIRECT:/admin/settings?error=INVALID_SITE_SETTINGS")
    expect(mocks.saveSiteConfig).not.toHaveBeenCalled()
  })

  it("does not save when authorization redirects an unauthenticated request", async () => {
    mocks.requireAdmin.mockRejectedValue(new Error("REDIRECT:/admin/login"))

    await expect(
      updateSiteSettingsAction(createSettingsForm(defaultSiteConfig))
    ).rejects.toThrow("REDIRECT:/admin/login")
    expect(mocks.saveSiteConfig).not.toHaveBeenCalled()
    expect(mocks.revalidatePath).not.toHaveBeenCalled()
  })

  it("saves before revalidating settings paths and redirecting", async () => {
    await expect(
      updateSiteSettingsAction(createSettingsForm(defaultSiteConfig))
    ).rejects.toThrow("REDIRECT:/admin/settings?notice=site-settings-saved")

    expect(mocks.saveSiteConfig).toHaveBeenCalledWith(siteSettingsData)
    expect(mocks.revalidatePath).toHaveBeenNthCalledWith(1, "/", "layout")
    expect(mocks.revalidatePath).toHaveBeenNthCalledWith(2, "/admin/settings")
    expect(mocks.revalidatePath).toHaveBeenNthCalledWith(3, "/sitemap.xml")
    expect(mocks.revalidatePath).toHaveBeenNthCalledWith(4, "/robots.txt")
    expect(mocks.revalidatePath).toHaveBeenNthCalledWith(5, "/rss.xml")
    expect(mocks.revalidatePath).toHaveBeenNthCalledWith(6, "/opengraph-image")
    expect(
      mocks.saveSiteConfig.mock.invocationCallOrder[0]
    ).toBeLessThan(mocks.revalidatePath.mock.invocationCallOrder[0])
  })

  it("preserves known storage error keys", async () => {
    mocks.saveSiteConfig.mockRejectedValue(new Error("DATABASE_NOT_CONFIGURED"))

    await expect(
      updateSiteSettingsAction(createSettingsForm(defaultSiteConfig))
    ).rejects.toThrow(
      "REDIRECT:/admin/settings?error=DATABASE_NOT_CONFIGURED"
    )
    expect(mocks.revalidatePath).not.toHaveBeenCalled()
  })

  it("maps unknown storage failures to the stable save error", async () => {
    mocks.saveSiteConfig.mockRejectedValue(new Error("database unavailable"))

    await expect(
      updateSiteSettingsAction(createSettingsForm(defaultSiteConfig))
    ).rejects.toThrow(
      "REDIRECT:/admin/settings?error=SITE_SETTINGS_SAVE_FAILED"
    )
    expect(mocks.revalidatePath).not.toHaveBeenCalled()
  })
})
