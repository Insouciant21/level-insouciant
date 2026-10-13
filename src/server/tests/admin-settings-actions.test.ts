import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
  redirect: vi.fn((path: string): never => {
    throw new Error(`REDIRECT:${path}`)
  }),
  requireAdmin: vi.fn(),
  saveSiteConfig: vi.fn(),
}))

vi.mock("@/server/request-context", () => ({
  redirect: mocks.redirect,
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
} from "@/server/actions/admin-settings-actions"

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
    expect(
      parseSiteSettingsFormData(createSettingsForm(defaultSiteConfig))
    ).toEqual(siteSettingsData)
  })

  it("redirects malformed JSON as invalid site settings", async () => {
    const formData = new FormData()
    formData.set("settings", "{")

    await expect(updateSiteSettingsAction(formData)).rejects.toThrow(
      "REDIRECT:/admin/settings?error=INVALID_SITE_SETTINGS"
    )
    expect(mocks.saveSiteConfig).not.toHaveBeenCalled()
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
  })

  it("saves before redirecting", async () => {
    await expect(
      updateSiteSettingsAction(createSettingsForm(defaultSiteConfig))
    ).rejects.toThrow("REDIRECT:/admin/settings?notice=site-settings-saved")

    expect(mocks.saveSiteConfig).toHaveBeenCalledWith(siteSettingsData)
    expect(mocks.saveSiteConfig.mock.invocationCallOrder[0]).toBeLessThan(
      mocks.redirect.mock.invocationCallOrder[0]
    )
  })

  it("preserves known storage error keys", async () => {
    mocks.saveSiteConfig.mockRejectedValue(new Error("DATABASE_NOT_CONFIGURED"))

    await expect(
      updateSiteSettingsAction(createSettingsForm(defaultSiteConfig))
    ).rejects.toThrow("REDIRECT:/admin/settings?error=DATABASE_NOT_CONFIGURED")
  })

  it("maps unknown storage failures to the stable save error", async () => {
    mocks.saveSiteConfig.mockRejectedValue(new Error("database unavailable"))

    await expect(
      updateSiteSettingsAction(createSettingsForm(defaultSiteConfig))
    ).rejects.toThrow(
      "REDIRECT:/admin/settings?error=SITE_SETTINGS_SAVE_FAILED"
    )
  })
})
