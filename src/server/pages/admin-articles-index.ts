import { getManagedArticles } from "@/lib/content-admin"

export async function load() {
  const articles = await getManagedArticles()

  return { articles }
}
