import { ArchiveSection } from "@/components/blog/archive-section"
import { EmptyState } from "@/components/blog/empty-state"
import { PageIntro } from "@/components/blog/page-intro"
import { PageShell } from "@/components/blog/page-shell"

import type { load } from "@/server/pages/categories-index"
import { IslandProvider } from "@/components/providers/island-provider"
function View({ categories }: Awaited<ReturnType<typeof load>>) {
  return (
    <PageShell>
      <PageIntro eyebrow="Categories" title="分类归档" />

      {categories.length > 0 ? (
        <ArchiveSection items={categories} title="全部分类" type="categories" />
      ) : (
        <EmptyState
          title="暂时还没有分类"
          description="发布文章后，分类会自动从数据库中的文章记录里汇总出来。"
        />
      )}
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
