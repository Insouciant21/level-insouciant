import { cache } from "react"

import { isAuthStorageEnabled } from "@/lib/auth-credentials"
import { prisma } from "@/lib/prisma"
import {
  defaultSiteConfig,
  type SiteConfig,
  type SiteConfigData,
} from "@/lib/site"
import {
  mergeSiteConfig,
  normalizeSiteConfigData,
  siteConfigOverridesSchema,
} from "@/lib/validation/site-settings"

export const SITE_CONFIG_ID = "default"

export function parseStoredSiteConfig(value: unknown): SiteConfig {
  const parsed = siteConfigOverridesSchema.safeParse(value)

  return parsed.success ? mergeSiteConfig(parsed.data) : mergeSiteConfig({})
}

export const getSiteConfig = cache(async (): Promise<SiteConfig> => {
  if (!isAuthStorageEnabled()) {
    return defaultSiteConfig
  }

  try {
    const stored = await prisma.siteConfig.findUnique({
      where: { id: SITE_CONFIG_ID },
      select: { data: true },
    })

    return parseStoredSiteConfig(stored?.data)
  } catch {
    return defaultSiteConfig
  }
})

export async function saveSiteConfig(data: SiteConfigData): Promise<void> {
  if (!isAuthStorageEnabled()) {
    throw new Error("DATABASE_NOT_CONFIGURED")
  }

  const normalized = normalizeSiteConfigData(data)

  await prisma.siteConfig.upsert({
    where: { id: SITE_CONFIG_ID },
    create: { id: SITE_CONFIG_ID, data: normalized },
    update: { data: normalized },
  })
}
