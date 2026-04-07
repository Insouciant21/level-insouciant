import type { Metadata } from "next"

import { ArticleCard } from "@/components/blog/article-card"
import { EmptyState } from "@/components/blog/empty-state"
import { PageIntro } from "@/components/blog/page-intro"
import { PageShell } from "@/components/blog/page-shell"
import { getAllArticles } from "@/lib/content"
import { createPageMetadata } from "@/lib/seo"

export const metadata: Metadata = createPageMetadata({
  title: "层级档案",
  description: "浏览所有已公开的层级记录、观察笔记与世界观档案。",
  path: "/articles",
})

export default async function ArticlesPage() {
  const articles = await getAllArticles()

  return (
    <PageShell>
      <PageIntro
        eyebrow="Archive"
        title="层级档案"
        description="所有公开记录都按照统一元数据整理，方便沿关键词、分类和时间线继续向深处下潜。"
      />

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
