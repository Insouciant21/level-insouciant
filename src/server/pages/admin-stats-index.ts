import { getArticleStats } from "@/lib/admin"

export async function load() {
  const articles = await getArticleStats()

  return { articles }
}
