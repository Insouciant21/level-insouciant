import { ArticleCard } from "@/components/blog/article-card"
import { PageIntro } from "@/components/blog/page-intro"
import { PageShell } from "@/components/blog/page-shell"

import type { load } from "@/server/pages/categories-category-index"
import { IslandProvider } from "@/components/providers/island-provider"
function View({ archive }: Awaited<ReturnType<typeof load>>) {
  return (
    <PageShell>
      <PageIntro
        eyebrow="Category"
        title={archive.name}
        description={`这里收录所有属于“${archive.name}”分类的公开档案。`}
      />
      <section className="grid gap-5">
        {archive.articles.map((article) => (
          <ArticleCard key={article.slug} article={article} />
        ))}
      </section>
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
