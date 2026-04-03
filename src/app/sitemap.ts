import type { MetadataRoute } from "next"

import {
  getAllArticles,
  getAllCategories,
  getAllTags,
  getArticlesByCategory,
  getArticlesByTag,
} from "@/lib/content"
import { absoluteUrl } from "@/lib/seo"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [articles, tags, categories] = await Promise.all([
    getAllArticles(),
    getAllTags(),
    getAllCategories(),
  ])

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/"),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: absoluteUrl("/articles"),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/about"),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: absoluteUrl("/tags"),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: absoluteUrl("/categories"),
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ]

  const articleRoutes: MetadataRoute.Sitemap = articles.map((article) => ({
    url: absoluteUrl(`/articles/${article.slug}`),
    lastModified: new Date(article.date),
    changeFrequency: "monthly",
    priority: 0.8,
  }))

  const tagRoutes: MetadataRoute.Sitemap = await Promise.all(
    tags.map(async (tag) => {
      const archive = await getArticlesByTag(tag.slug)
      const latestDate = archive?.articles[0]?.date

      return {
        url: absoluteUrl(`/tags/${tag.slug}`),
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
        url: absoluteUrl(`/categories/${category.slug}`),
        ...(latestDate ? { lastModified: new Date(latestDate) } : {}),
        changeFrequency: "weekly" as const,
        priority: 0.6,
      }
    })
  )

  return [...staticRoutes, ...articleRoutes, ...tagRoutes, ...categoryRoutes]
}
