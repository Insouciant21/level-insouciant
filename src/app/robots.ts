import type { MetadataRoute } from "next"

import { absoluteUrl } from "@/lib/seo"
import { getSiteConfig } from "@/lib/site-config"

export default async function robots(): Promise<MetadataRoute.Robots> {
  const siteConfig = await getSiteConfig()

  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: absoluteUrl("/sitemap.xml", siteConfig),
    host: absoluteUrl("/", siteConfig),
  }
}
