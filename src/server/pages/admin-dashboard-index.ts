import { getDashboardOverview, getArticleStats } from "@/lib/admin"

export async function load() {
  const [overview, articleStats] = await Promise.all([
    getDashboardOverview(),
    getArticleStats(),
  ])
  const drafts = articleStats.filter((article) => article.draft).slice(0, 5)
  const topArticles = articleStats.slice(0, 5)

  return { overview, drafts, topArticles }
}
