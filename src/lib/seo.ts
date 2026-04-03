import type { Metadata } from "next"

import type { Article } from "@/types/blog"
import { siteConfig } from "@/lib/site"

type SeoOptions = {
  title: string
  description: string
  path: string
  type?: "website" | "article"
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

export function absoluteUrl(path = "/") {
  return new URL(normalizePath(path), siteConfig.url).toString()
}

export function createPageMetadata({
  title,
  description,
  path,
  type = "website",
  publishedTime,
  modifiedTime,
  tags,
  imagePath,
}: SeoOptions): Metadata {
  const canonical = absoluteUrl(path)
  const image = imagePath ? absoluteUrl(imagePath) : absoluteUrl("/opengraph-image")

  return {
    title,
    description,
    keywords: [...siteConfig.seo.keywords],
    alternates: {
      canonical,
      types: {
        "application/rss+xml": absoluteUrl("/rss.xml"),
      },
    },
    openGraph: {
      type,
      url: canonical,
      title,
      description,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      images: [
        {
          url: image,
          alt: siteConfig.seo.defaultOgImageAlt,
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
  }
}

export function createArticleMetadata(article: Article): Metadata {
  return createPageMetadata({
    title: article.title,
    description: article.desc,
    path: `/articles/${article.slug}`,
    type: "article",
    publishedTime: article.date,
    modifiedTime: article.date,
    tags: article.tags,
    imagePath: `/articles/${article.slug}/opengraph-image`,
  })
}

export function createWebsiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    inLanguage: siteConfig.language,
    author: {
      "@type": "Person",
      name: siteConfig.author,
      email: siteConfig.email,
    },
    publisher: {
      "@type": "Person",
      name: siteConfig.author,
      email: siteConfig.email,
    },
  }
}

export function createBlogPostingJsonLd(article: Article) {
  const articleUrl = absoluteUrl(`/articles/${article.slug}`)

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: article.desc,
    datePublished: article.date,
    dateModified: article.date,
    mainEntityOfPage: articleUrl,
    url: articleUrl,
    inLanguage: siteConfig.language,
    keywords: article.tags.join(", "),
    articleSection: article.category,
    author: {
      "@type": "Person",
      name: siteConfig.author,
      email: siteConfig.email,
    },
    publisher: {
      "@type": "Person",
      name: siteConfig.author,
      email: siteConfig.email,
    },
    isPartOf: {
      "@type": "Blog",
      name: siteConfig.name,
      url: absoluteUrl("/articles"),
    },
  }
}

export function createArticleJsonLd(article: Article) {
  return JSON.stringify(createBlogPostingJsonLd(article))
}

export function createWebsiteJsonLdString() {
  return JSON.stringify(createWebsiteJsonLd())
}

export function buildRssXml(
  articles: Array<{
    slug: string
    title: string
    desc: string
    date: string
    category: string
    tags: string[]
  }>
) {
  const latestDate = articles[0]?.date ?? new Date().toISOString()

  const items = articles
    .map((article) => {
      const url = absoluteUrl(`/articles/${article.slug}`)

      return `
    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${url}</link>
      <guid>${url}</guid>
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
    <title>${escapeXml(siteConfig.name)}</title>
    <link>${siteConfig.url}</link>
    <description>${escapeXml(siteConfig.description)}</description>
    <language>${siteConfig.language}</language>
    <lastBuildDate>${new Date(latestDate).toUTCString()}</lastBuildDate>
    <atom:link href="${absoluteUrl("/rss.xml")}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`
}

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;")
}
