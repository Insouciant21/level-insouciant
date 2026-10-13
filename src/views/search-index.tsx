import { PageShell } from "@/components/blog/page-shell"
import { SearchConsole } from "@/components/blog/search-console"

import type { load } from "@/server/pages/search-index"
import { IslandProvider } from "@/components/providers/island-provider"
function View({ q }: Awaited<ReturnType<typeof load>>) {
  return (
    <PageShell className="gap-0 py-0">
      <SearchConsole initialQuery={q} />
    </PageShell>
  )
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
