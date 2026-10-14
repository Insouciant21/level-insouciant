import { describe, expect, it } from "vitest"

import {
  absoluteUrl,
  buildRssXml,
  createArticleJsonLd,
  createArticleMetadata,
  createBlogPostingJsonLd,
  createPageMetadata,
  createWebsiteJsonLd,
  createWebsiteJsonLdString,
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
  archiveCode: "A-0001",
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

  it("escapes script-breaking characters in website and article JSON-LD strings", () => {
    const unsafeSiteConfig = {
      ...customSiteConfig,
      name: "</script><script>alert(1)</script>&",
      description: "Description with </script> & ampersand",
      author: "</script>& Maintainer",
      email: "unsafe@example.test",
    } satisfies SiteConfig
    const unsafeArticle = {
      ...article,
      title: "Article </script>& title",
      desc: "Article </script>& description",
    } satisfies Article

    const websiteJsonLd = createWebsiteJsonLdString(unsafeSiteConfig)
    const articleJsonLd = createArticleJsonLd(unsafeArticle, unsafeSiteConfig)

    expect(websiteJsonLd).not.toContain("</script>")
    expect(articleJsonLd).not.toContain("</script>")
    expect(websiteJsonLd).toContain("\\u003c/script\\u003e")
    expect(articleJsonLd).toContain("\\u003c/script\\u003e")
    expect(websiteJsonLd).toContain("\\u0026")
    expect(articleJsonLd).toContain("\\u0026")
  })

  it("escapes query-string URLs in RSS text and URL fields", () => {
    const querySiteConfig = {
      ...customSiteConfig,
      url: "https://example.test/archive?ref=one&mode=full",
    } satisfies SiteConfig
    const queryArticle = {
      ...article,
      slug: "configured-entry?from=one&to=two",
    } satisfies Article

    const rss = buildRssXml([queryArticle], querySiteConfig)
    const articleUrl =
      "https://example.test/articles/configured-entry?from=one&to=two"
    const escapedArticleUrl =
      "https://example.test/articles/configured-entry?from=one&amp;to=two"

    expect(rss).toContain(
      "<link>https://example.test/archive?ref=one&amp;mode=full</link>"
    )
    expect(rss).not.toContain(`<link>${querySiteConfig.url}</link>`)
    expect(rss).toContain(`<link>${escapedArticleUrl}</link>`)
    expect(rss).toContain(`<guid>${escapedArticleUrl}</guid>`)
    expect(rss).not.toContain(`<link>${articleUrl}</link>`)
    expect(rss).not.toContain(`<guid>${articleUrl}</guid>`)
    expect(rss).toContain(
      '<atom:link href="https://example.test/rss.xml" rel="self" type="application/rss+xml" />'
    )
  })
})
