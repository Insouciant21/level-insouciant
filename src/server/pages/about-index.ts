import type { Metadata } from "@/types/seo"
import { createPageMetadata } from "@/lib/seo"
import { getSiteConfig } from "@/lib/site-config"

export async function load() {
  const siteConfig = await getSiteConfig()
  const contactItems = siteConfig.contacts.filter((contact) => contact.enabled)

  return { siteConfig, contactItems }
}
export async function generateMetadata(): Promise<Metadata> {
  const siteConfig = await getSiteConfig()

  return createPageMetadata(
    {
      title: siteConfig.about.metadataTitle,
      description: siteConfig.about.metadataDescription,
      path: "/about",
    },
    siteConfig
  )
}
