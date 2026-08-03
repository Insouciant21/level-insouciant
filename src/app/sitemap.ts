import type { MetadataRoute } from "next"

import {
  getAllArticles,
  getAllCategories,
  getAllTags,
  getArticlesByCategory,
  getArticlesByTag,
} from "@/lib/content"
import { absoluteUrl } from "@/lib/seo"
import { getSiteConfig } from "@/lib/site-config"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [siteConfig, articles, tags, categories] = await Promise.all([
    getSiteConfig(),
    getAllArticles(),
    getAllTags(),
    getAllCategories(),
  ])

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/", siteConfig),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: absoluteUrl("/articles", siteConfig),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/about", siteConfig),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: absoluteUrl("/tags", siteConfig),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: absoluteUrl("/categories", siteConfig),
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ]

  const articleRoutes: MetadataRoute.Sitemap = articles.map((article) => ({
    url: absoluteUrl(`/articles/${article.slug}`, siteConfig),
    lastModified: new Date(article.date),
    changeFrequency: "monthly",
    priority: 0.8,
  }))

  const tagRoutes: MetadataRoute.Sitemap = await Promise.all(
    tags.map(async (tag) => {
      const archive = await getArticlesByTag(tag.slug)
      const latestDate = archive?.articles[0]?.date

      return {
        url: absoluteUrl(`/tags/${tag.slug}`, siteConfig),
        ...(latestDate ? { lastModified: new Date(latestDate) } : {}),
        changeFrequency: "weekly" as const,
        priority: 0.6,
      }
    })
  )

  const categoryRoutes: MetadataRoute.Sitemap = await Promise.all(
    categories.map(async (category) => {
      const archive = await getArticlesByCategory(category.slug)
      const latestDate = archive?.articles[0]?.date

      return {
        url: absoluteUrl(`/categories/${category.slug}`, siteConfig),
        ...(latestDate ? { lastModified: new Date(latestDate) } : {}),
        changeFrequency: "weekly" as const,
        priority: 0.6,
      }
    })
  )

  return [...staticRoutes, ...articleRoutes, ...tagRoutes, ...categoryRoutes]
}
