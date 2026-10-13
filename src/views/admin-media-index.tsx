import { MediaLibrary } from "@/components/admin/media/media-library"

import type { load } from "@/server/pages/admin-media-index"
import { IslandProvider } from "@/components/providers/island-provider"
function View({ initialData }: Awaited<ReturnType<typeof load>>) {
  return <MediaLibrary initialData={initialData} />
}
export default function Page(
  props: Awaited<ReturnType<typeof load>> & { location: string }
) {
  return (
    <IslandProvider location={props.location}>
      <View {...props} />
    </IslandProvider>
  )
}
