import { MediaLibrary } from "@/components/admin/media/media-library"
import { listMediaAssets } from "@/lib/media/assets"

export default async function AdminMediaPage() {
  const initialData = await listMediaAssets({ page: 1, pageSize: 24 })

  return <MediaLibrary initialData={initialData} />
}
