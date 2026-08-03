import { beforeEach, describe, expect, it, vi } from "vitest"

import { isAuthStorageEnabled } from "@/lib/auth-credentials"
import { prisma } from "@/lib/prisma"
import { defaultSiteConfig } from "@/lib/site"
import {
  getSiteConfig,
  parseStoredSiteConfig,
  saveSiteConfig,
  SITE_CONFIG_ID,
} from "@/lib/site-config"

vi.mock("@/lib/auth-credentials", () => ({
  isAuthStorageEnabled: vi.fn(),
}))

vi.mock("@/lib/prisma", () => ({
  prisma: {
    siteConfig: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
    },
  },
}))

describe("site config repository", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("returns defaults without a database", async () => {
    vi.mocked(isAuthStorageEnabled).mockReturnValue(false)

    await expect(getSiteConfig()).resolves.toMatchObject({
      name: "Level Insouciant",
    })
    expect(prisma.siteConfig.findUnique).not.toHaveBeenCalled()
  })

  it("merges a valid stored override with defaults", async () => {
    vi.mocked(isAuthStorageEnabled).mockReturnValue(true)
    vi.mocked(prisma.siteConfig.findUnique).mockResolvedValue({
      data: { name: "Custom Archive" },
    } as never)

    await expect(getSiteConfig()).resolves.toMatchObject({
      name: "Custom Archive",
      hero: { title: "Level Insouciant" },
    })
  })

  it("falls back without mutating an invalid stored payload", async () => {
    vi.mocked(isAuthStorageEnabled).mockReturnValue(true)
    vi.mocked(prisma.siteConfig.findUnique).mockResolvedValue({
      data: { url: "javascript:bad" },
    } as never)

    await expect(getSiteConfig()).resolves.toMatchObject({
      name: "Level Insouciant",
    })
    expect(prisma.siteConfig.upsert).not.toHaveBeenCalled()
  })

  it("falls back when reading stored settings fails", async () => {
    vi.mocked(isAuthStorageEnabled).mockReturnValue(true)
    vi.mocked(prisma.siteConfig.findUnique).mockRejectedValue(new Error("database down"))

    await expect(getSiteConfig()).resolves.toMatchObject({
      name: "Level Insouciant",
    })
  })

  it("parses valid stored settings into a complete config", () => {
    expect(parseStoredSiteConfig({ name: "Custom Archive" })).toMatchObject({
      name: "Custom Archive",
      hero: { title: "Level Insouciant" },
    })
  })

  it("upserts the normalized settings document under the default id", async () => {
    vi.mocked(isAuthStorageEnabled).mockReturnValue(true)
    vi.mocked(prisma.siteConfig.upsert).mockResolvedValue({} as never)

    await saveSiteConfig(defaultSiteConfig)

    expect(prisma.siteConfig.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: SITE_CONFIG_ID },
        create: expect.objectContaining({ id: SITE_CONFIG_ID }),
        update: expect.objectContaining({ data: expect.any(Object) }),
      })
    )
  })

  it("rejects writes without a database", async () => {
    vi.mocked(isAuthStorageEnabled).mockReturnValue(false)

    await expect(saveSiteConfig(defaultSiteConfig)).rejects.toThrow("DATABASE_NOT_CONFIGURED")
    expect(prisma.siteConfig.upsert).not.toHaveBeenCalled()
  })
})
