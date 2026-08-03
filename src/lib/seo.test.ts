import { describe, expect, it } from "vitest"

import {
  absoluteUrl,
  buildRssXml,
  createArticleMetadata,
  createBlogPostingJsonLd,
  createPageMetadata,
  createWebsiteJsonLd,
} from "@/lib/seo"
import { defaultSiteConfig, type SiteConfig } from "@/lib/site"
import type { Article } from "@/types/blog"

const customSiteConfig = {
  ...defaultSiteConfig,
  name: "Custom Archive",
  description: "A configured archive description.",
  url: "https://example.test",
  author: "Maintainer",
  email: "maintainer@example.test",
  contacts: [
    {
      id: "relay",
      kind: "custom",
      label: "Signal Relay",
      value: "custom.example.test",
      href: "https://custom.example.test/contact",
      enabled: true,
    },
  ],
  seo: {
    keywords: ["configured", "archive"],
    defaultOgImageAlt: "Configured archive cover",
  },
} satisfies SiteConfig

const article = {
  slug: "configured-entry",
  title: "Configured Entry",
  desc: "An entry from the configured archive.",
  date: "2026-08-03T12:00:00.000Z",
  category: "Signals",
  tags: ["configuration", "seo"],
  cover: null,
  draft: false,
  content: "Entry body",
} satisfies Article

describe("configured SEO helpers", () => {
  it("uses the provided site identity and canonical URL for page metadata", () => {
    const metadata = createPageMetadata(
      {
        title: "About the archive",
        description: "Configured metadata.",
        path: "/about",
      },
      customSiteConfig
    )

    expect(absoluteUrl("/about", customSiteConfig)).toBe(
      "https://example.test/about"
    )
    expect(metadata).toMatchObject({
      keywords: ["configured", "archive"],
      alternates: {
        canonical: "https://example.test/about",
        types: {
          "application/rss+xml": "https://example.test/rss.xml",
        },
      },
      openGraph: {
        url: "https://example.test/about",
        siteName: "Custom Archive",
        locale: customSiteConfig.locale,
        images: [
          {
            url: "https://example.test/opengraph-image",
            alt: "Configured archive cover",
          },
        ],
      },
    })

    expect(createWebsiteJsonLd(customSiteConfig)).toMatchObject({
      name: "Custom Archive",
      description: "A configured archive description.",
      url: "https://example.test",
      author: {
        name: "Maintainer",
        email: "maintainer@example.test",
      },
    })
  })

  it("uses one provided config for article metadata, JSON-LD, and RSS", () => {
    expect(createArticleMetadata(article, customSiteConfig)).toMatchObject({
      alternates: {
        canonical: "https://example.test/articles/configured-entry",
      },
      openGraph: {
        siteName: "Custom Archive",
        url: "https://example.test/articles/configured-entry",
      },
    })

    expect(createBlogPostingJsonLd(article, customSiteConfig)).toMatchObject({
      mainEntityOfPage: "https://example.test/articles/configured-entry",
      url: "https://example.test/articles/configured-entry",
      author: { name: "Maintainer" },
      isPartOf: {
        name: "Custom Archive",
        url: "https://example.test/articles",
      },
    })

    const rss = buildRssXml([article], customSiteConfig)

    expect(rss).toContain("<title>Custom Archive</title>")
    expect(rss).toContain("<link>https://example.test</link>")
    expect(rss).toContain(
      "<link>https://example.test/articles/configured-entry</link>"
    )
    expect(rss).toContain(
      '<atom:link href="https://example.test/rss.xml" rel="self" type="application/rss+xml" />'
    )
  })
})
