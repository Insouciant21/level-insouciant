import { getManagedTags } from "@/lib/content-admin"

export async function load() {
  const tags = await getManagedTags()

  return { tags }
}
