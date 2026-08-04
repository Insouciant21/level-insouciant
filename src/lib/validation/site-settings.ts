import { z } from "zod"

import {
  defaultSiteConfig,
  type ContactKind,
  type SiteConfig,
  type SiteConfigData,
} from "@/lib/site"

const MAX_CONTACTS = 12
const MAX_FOOTER_LINKS = 12
const contactKinds = [
  "github",
  "email",
  "steam",
  "twitter",
  "linkedin",
  "netease",
  "bilibili",
  "website",
  "custom",
] as const

function normalizedText(maximum: number) {
  return z.string().trim().min(1).max(maximum)
}

function singleLineText(maximum: number) {
  return normalizedText(maximum).refine((value) => !/[\r\n]/.test(value), {
    message: "Must be a single line",
  })
}

function isCanonicalSiteUrl(value: string) {
  try {
    const url = new URL(value)
    return url.protocol === "http:" || url.protocol === "https:"
  } catch {
    return false
  }
}

function isSafeLinkHref(value: string) {
  if (value.startsWith("/") && !value.startsWith("//") && !value.startsWith("/\\")) {
    return true
  }

  try {
    const url = new URL(value)
    return ["http:", "https:", "mailto:", "tel:"].includes(url.protocol)
  } catch {
    return false
  }
}

const canonicalSiteUrlSchema = normalizedText(2_048).refine(isCanonicalSiteUrl, {
  message: "Must use an http or https URL",
})

const safeLinkHrefSchema = normalizedText(2_048).refine(isSafeLinkHref, {
  message: "Must use a safe link URL",
})

const actionSchema = z.object({
  label: singleLineText(100),
  href: safeLinkHrefSchema,
})

const siteLinkSchema = z.object({
  id: singleLineText(100),
  kind: z.enum(contactKinds),
  label: singleLineText(100),
  value: singleLineText(2_048),
  href: safeLinkHrefSchema,
  enabled: z.boolean(),
})

const legacySiteLinkSchema = siteLinkSchema.extend({
  kind: z
    .string()
    .trim()
    .min(1)
    .transform((kind): ContactKind =>
      contactKinds.includes(kind as ContactKind) ? (kind as ContactKind) : "custom"
    ),
})

const heroSchema = z.object({
  eyebrow: singleLineText(100),
  title: singleLineText(100),
  primaryAction: actionSchema,
  secondaryAction: actionSchema,
})

const aboutSchema = z.object({
  metadataTitle: singleLineText(100),
  metadataDescription: normalizedText(240),
  displayTitle: singleLineText(100),
  archiveNodeLabel: singleLineText(100),
  statusLabel: singleLineText(100),
  statusValue: singleLineText(100),
  quote: normalizedText(5_000),
  intro: normalizedText(5_000),
  principles: normalizedText(5_000),
  contactHeading: singleLineText(100),
  archiveAccess: actionSchema,
  transmission: actionSchema,
})

const profileSchema = z.object({
  title: singleLineText(100),
  summary: normalizedText(5_000),
  status: singleLineText(100),
  location: singleLineText(100),
})

const footerSchema = z.object({
  links: z.array(siteLinkSchema).max(MAX_FOOTER_LINKS),
})

const seoSchema = z.object({
  keywords: z.array(normalizedText(40)).max(20),
  defaultOgImageAlt: normalizedText(240),
})

export const siteConfigDataSchema = z.object({
  name: singleLineText(80),
  description: normalizedText(240),
  author: singleLineText(80),
  email: normalizedText(254).email(),
  url: canonicalSiteUrlSchema,
  hero: heroSchema,
  about: aboutSchema,
  profile: profileSchema,
  contacts: z.array(siteLinkSchema).max(MAX_CONTACTS),
  footer: footerSchema,
  seo: seoSchema,
})

export const siteConfigOverridesSchema = z.object({
  name: singleLineText(80).optional(),
  description: normalizedText(240).optional(),
  author: singleLineText(80).optional(),
  email: normalizedText(254).email().optional(),
  url: canonicalSiteUrlSchema.optional(),
  hero: z
    .object({
      eyebrow: singleLineText(100).optional(),
      title: singleLineText(100).optional(),
      primaryAction: actionSchema.partial().optional(),
      secondaryAction: actionSchema.partial().optional(),
    })
    .partial()
    .optional(),
  about: z
    .object({
      metadataTitle: singleLineText(100).optional(),
      metadataDescription: normalizedText(240).optional(),
      displayTitle: singleLineText(100).optional(),
      archiveNodeLabel: singleLineText(100).optional(),
      statusLabel: singleLineText(100).optional(),
      statusValue: singleLineText(100).optional(),
      quote: normalizedText(5_000).optional(),
      intro: normalizedText(5_000).optional(),
      principles: normalizedText(5_000).optional(),
      contactHeading: singleLineText(100).optional(),
      archiveAccess: actionSchema.partial().optional(),
      transmission: actionSchema.partial().optional(),
    })
    .partial()
    .optional(),
  profile: profileSchema.partial().optional(),
  contacts: z.array(legacySiteLinkSchema).max(MAX_CONTACTS).optional(),
  footer: z
    .object({
      links: z.array(legacySiteLinkSchema).max(MAX_FOOTER_LINKS).optional(),
    })
    .partial()
    .optional(),
  seo: seoSchema.partial().optional(),
})

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function normalizeKeywords(value: unknown) {
  if (!Array.isArray(value)) {
    return value
  }

  const seen = new Set<string>()

  return value.reduce<string[]>((keywords, keyword) => {
    if (typeof keyword !== "string") {
      keywords.push(keyword as never)
      return keywords
    }

    const trimmed = keyword.trim()
    const dedupeKey = trimmed.toLocaleLowerCase()

    if (trimmed && !seen.has(dedupeKey)) {
      seen.add(dedupeKey)
      keywords.push(trimmed)
    }

    return keywords
  }, [])
}

function prepareForNormalization(input: unknown) {
  if (!isRecord(input)) {
    return input
  }

  const contacts = Array.isArray(input.contacts)
    ? input.contacts.map((contact, index) => {
        if (!isRecord(contact)) {
          return contact
        }

        const id = typeof contact.id === "string" ? contact.id.trim() : ""

        return {
          ...contact,
          id: id || `contact-${index + 1}`,
        }
      })
    : input.contacts
  const seo = isRecord(input.seo)
    ? { ...input.seo, keywords: normalizeKeywords(input.seo.keywords) }
    : input.seo

  return { ...input, contacts, seo }
}

function normalizeContactIds(contacts: SiteConfigData["contacts"]) {
  const ids = new Set<string>()

  return contacts.map((contact, index) => {
    let id = contact.id
    let suffix = 1

    while (ids.has(id.toLocaleLowerCase())) {
      id = `${contact.id}-${suffix}`
      suffix += 1
    }

    ids.add(id.toLocaleLowerCase())
    return { ...contact, id: id || `contact-${index + 1}` }
  })
}

export function normalizeSiteConfigData(input: unknown): SiteConfigData {
  const parsed = siteConfigDataSchema.parse(prepareForNormalization(input))

  return {
    ...parsed,
    contacts: normalizeContactIds(parsed.contacts),
  }
}

function validatedDefaultSiteConfig(): SiteConfig {
  return {
    ...defaultSiteConfig,
    ...normalizeSiteConfigData(defaultSiteConfig),
  }
}

export function mergeSiteConfig(overrides: unknown): SiteConfig {
  const result = siteConfigOverridesSchema.safeParse(overrides)

  if (!result.success) {
    return validatedDefaultSiteConfig()
  }

  const parsed = result.data
  const merged = {
    ...defaultSiteConfig,
    name: parsed.name ?? defaultSiteConfig.name,
    description: parsed.description ?? defaultSiteConfig.description,
    author: parsed.author ?? defaultSiteConfig.author,
    email: parsed.email ?? defaultSiteConfig.email,
    url: parsed.url ?? defaultSiteConfig.url,
    hero: {
      ...defaultSiteConfig.hero,
      ...parsed.hero,
      primaryAction: {
        ...defaultSiteConfig.hero.primaryAction,
        ...parsed.hero?.primaryAction,
      },
      secondaryAction: {
        ...defaultSiteConfig.hero.secondaryAction,
        ...parsed.hero?.secondaryAction,
      },
    },
    about: {
      ...defaultSiteConfig.about,
      ...parsed.about,
      archiveAccess: {
        ...defaultSiteConfig.about.archiveAccess,
        ...parsed.about?.archiveAccess,
      },
      transmission: {
        ...defaultSiteConfig.about.transmission,
        ...parsed.about?.transmission,
      },
    },
    profile: {
      ...defaultSiteConfig.profile,
      ...parsed.profile,
    },
    contacts: parsed.contacts ?? defaultSiteConfig.contacts,
    footer: {
      ...defaultSiteConfig.footer,
      ...parsed.footer,
      links: parsed.footer?.links ?? defaultSiteConfig.footer.links,
    },
    seo: {
      ...defaultSiteConfig.seo,
      ...parsed.seo,
    },
  }

  return {
    ...defaultSiteConfig,
    ...normalizeSiteConfigData(merged),
  }
}
