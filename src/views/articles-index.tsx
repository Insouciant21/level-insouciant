import { ArticleCard } from "@/components/blog/article-card"
import { EmptyState } from "@/components/blog/empty-state"
import { PageIntro } from "@/components/blog/page-intro"
import { PageShell } from "@/components/blog/page-shell"

import type { load } from "@/server/pages/articles-index"
import { IslandProvider } from "@/components/providers/island-provider"
function View({ articles }: Awaited<ReturnType<typeof load>>) {
  return (
    <PageShell>
      <PageIntro eyebrow="Archive" title="层级档案" />

      {articles.length > 0 ? (
        <section className="grid gap-5">
          {articles.map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </section>
      ) : (
        <EmptyState
          title="还没有可访问的档案"
          description="入口已经搭好，等第一批层级记录完成整理后这里会显示列表。"
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
