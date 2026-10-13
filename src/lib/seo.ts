import type { Metadata } from "@/types/seo"

import type { Article } from "@/types/blog"
import { defaultSiteConfig, type SiteConfig } from "@/lib/site"

type SeoOptions = {
  title: string
  description: string
  path: string
  type?: "website" | "article"
  noIndex?: boolean
  publishedTime?: string
  modifiedTime?: string
  tags?: string[]
  imagePath?: string
}

function normalizePath(path: string) {
  if (!path || path === "/") {
    return "/"
  }

  return path.startsWith("/") ? path : `/${path}`
}

export function absoluteUrl(
  path = "/",
  config: SiteConfig = defaultSiteConfig
) {
  return new URL(normalizePath(path), config.url).toString()
}

export function createPageMetadata(
  {
    title,
    description,
    path,
    type = "website",
    noIndex = false,
    publishedTime,
    modifiedTime,
    tags,
    imagePath,
  }: SeoOptions,
  config: SiteConfig = defaultSiteConfig
): Metadata {
  const canonical = absoluteUrl(path, config)
  const image = imagePath
    ? absoluteUrl(imagePath, config)
    : absoluteUrl("/opengraph-image", config)

  return {
    title,
    description,
    keywords: [...config.seo.keywords],
    alternates: {
      canonical,
      types: {
        "application/rss+xml": absoluteUrl("/rss.xml", config),
      },
    },
    openGraph: {
      type,
      url: canonical,
      title,
      description,
      siteName: config.name,
      locale: config.locale,
      images: [
        {
          url: image,
          alt: config.seo.defaultOgImageAlt,
        },
      ],
      ...(publishedTime ? { publishedTime } : {}),
      ...(modifiedTime ? { modifiedTime } : {}),
      ...(tags ? { tags } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
        }
      : undefined,
  }
}

export function createArticleMetadata(
  article: Article,
  config: SiteConfig = defaultSiteConfig
): Metadata {
  return createPageMetadata(
    {
      title: article.title,
      description: article.desc,
      path: `/articles/${article.slug}`,
      type: "article",
      publishedTime: article.date,
      modifiedTime: article.date,
      tags: article.tags,
      imagePath: `/articles/${article.slug}/opengraph-image`,
    },
    config
  )
}

export function createWebsiteJsonLd(config: SiteConfig = defaultSiteConfig) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: config.name,
    description: config.description,
    url: config.url,
    inLanguage: config.language,
    author: {
      "@type": "Person",
      name: config.author,
      email: config.email,
    },
    publisher: {
      "@type": "Person",
      name: config.author,
      email: config.email,
    },
  }
}

export function createBlogPostingJsonLd(
  article: Article,
  config: SiteConfig = defaultSiteConfig
) {
  const articleUrl = absoluteUrl(`/articles/${article.slug}`, config)

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: article.desc,
    datePublished: article.date,
    dateModified: article.date,
    mainEntityOfPage: articleUrl,
    url: articleUrl,
    inLanguage: config.language,
    keywords: article.tags.join(", "),
    articleSection: article.category,
    author: {
      "@type": "Person",
      name: config.author,
      email: config.email,
    },
    publisher: {
      "@type": "Person",
      name: config.author,
      email: config.email,
    },
    isPartOf: {
      "@type": "Blog",
      name: config.name,
      url: absoluteUrl("/articles", config),
    },
  }
}

export function createArticleJsonLd(
  article: Article,
  config: SiteConfig = defaultSiteConfig
) {
  return stringifyJsonLd(createBlogPostingJsonLd(article, config))
}

export function createWebsiteJsonLdString(
  config: SiteConfig = defaultSiteConfig
) {
  return stringifyJsonLd(createWebsiteJsonLd(config))
}

export function buildRssXml(
  articles: Array<{
    slug: string
    title: string
    desc: string
    date: string
    category: string
    tags: string[]
  }>,
  config: SiteConfig = defaultSiteConfig
) {
  const latestDate = articles[0]?.date ?? new Date().toISOString()

  const items = articles
    .map((article) => {
      const url = absoluteUrl(`/articles/${article.slug}`, config)

      return `
    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${escapeXml(url)}</link>
      <guid>${escapeXml(url)}</guid>
      <description>${escapeXml(article.desc)}</description>
      <pubDate>${new Date(article.date).toUTCString()}</pubDate>
      <category>${escapeXml(article.category)}</category>
      ${article.tags.map((tag) => `<category>${escapeXml(tag)}</category>`).join("")}
    </item>`
    })
    .join("\n")

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(config.name)}</title>
    <link>${escapeXml(config.url)}</link>
    <description>${escapeXml(config.description)}</description>
    <language>${config.language}</language>
    <lastBuildDate>${new Date(latestDate).toUTCString()}</lastBuildDate>
    <atom:link href="${escapeXml(absoluteUrl("/rss.xml", config))}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`
}

function stringifyJsonLd(value: object) {
  return JSON.stringify(value)
    .replaceAll("<", "\\u003c")
    .replaceAll(">", "\\u003e")
    .replaceAll("&", "\\u0026")
}

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;")
}
