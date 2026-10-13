import { listMediaAssets } from "@/lib/media/assets"

export async function load() {
  const initialData = await listMediaAssets({ page: 1, pageSize: 24 })

  return { initialData }
}
