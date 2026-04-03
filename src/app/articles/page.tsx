import type { Metadata } from "next"

import { ArticleCard } from "@/components/blog/article-card"
import { EmptyState } from "@/components/blog/empty-state"
import { PageIntro } from "@/components/blog/page-intro"
import { PageShell } from "@/components/blog/page-shell"
import { getAllArticles } from "@/lib/content"
import { createPageMetadata } from "@/lib/seo"

export const metadata: Metadata = createPageMetadata({
  title: "博客",
  description: "浏览所有已公开的技术文章与个人随笔。",
  path: "/articles",
})

export default async function ArticlesPage() {
  const articles = await getAllArticles()

  return (
    <PageShell>
      <PageIntro
        eyebrow="Articles"
        title="博客"
        description="所有公开文章都按照统一元数据组织，方便阅读、归档和后续扩展。"
      />

      {articles.length > 0 ? (
        <section className="grid gap-5">
          {articles.map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </section>
      ) : (
        <EmptyState
          title="还没有可阅读的文章"
          description="内容目录已经搭好，等第一篇文章正式发布后这里会显示列表。"
        />
      )}
    </PageShell>
  )
}
