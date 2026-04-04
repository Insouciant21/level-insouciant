import type { Metadata } from "next"
import Link from "next/link"
import { Search } from "lucide-react"

import { ArticleCard } from "@/components/blog/article-card"
import { EmptyState } from "@/components/blog/empty-state"
import { PageIntro } from "@/components/blog/page-intro"
import { PageShell } from "@/components/blog/page-shell"
import { Button } from "@/components/ui/button"
import { getAllArticles, searchArticles } from "@/lib/content"
import { createPageMetadata } from "@/lib/seo"

type SearchPageProps = {
  searchParams: Promise<{
    q?: string
  }>
}

export const metadata: Metadata = {
  ...createPageMetadata({
    title: "搜索",
    description: "按标题、摘要、正文、分类和标签检索博客内容。",
    path: "/search",
  }),
  robots: {
    index: false,
    follow: true,
  },
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q = "" } = await searchParams
  const query = q.trim()
  const [results, allArticles] = await Promise.all([
    query ? searchArticles(query) : Promise.resolve([]),
    getAllArticles(),
  ])

  return (
    <PageShell>
      <PageIntro
        eyebrow="Search"
        title="搜索"
        description="可以按标题、摘要、正文、分类和标签检索内容，适合快速回找已经写过的主题。"
      />

      <section className="surface-panel px-6 py-6">
        <form action="/search" className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto]">
          <label className="grid gap-2">
            <span className="text-sm font-medium">搜索关键词</span>
            <div className="flex items-center gap-3 rounded-[1.5rem] border border-border/70 bg-background/70 px-4 py-3">
              <Search className="size-4 text-muted-foreground" />
              <input
                type="search"
                name="q"
                defaultValue={query}
                placeholder="例如：frontend、writing、长期主义"
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
          </label>
          <div className="flex items-end gap-3">
            <Button type="submit" className="rounded-full px-5">
              搜索
            </Button>
            {query ? (
              <Button asChild type="button" variant="outline" className="rounded-full px-5">
                <Link href="/search">清空</Link>
              </Button>
            ) : null}
          </div>
        </form>

        <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span>{query ? `共找到 ${results.length} 条结果` : `当前共有 ${allArticles.length} 篇公开文章可检索`}</span>
          <span>支持标题、摘要、正文、分类、标签匹配</span>
        </div>
      </section>

      {query ? (
        results.length > 0 ? (
          <section className="grid gap-5">
            {results.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </section>
        ) : (
          <EmptyState
            title="没有找到匹配内容"
            description={`暂时没有和“${query}”匹配的文章，可以换一个关键词继续试试。`}
          />
        )
      ) : (
        <section className="grid gap-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold tracking-tight">最近文章</h2>
            <p className="text-sm text-muted-foreground">还没输入关键词时，先从最新内容开始</p>
          </div>
          {allArticles.length > 0 ? (
            allArticles.slice(0, 5).map((article) => <ArticleCard key={article.slug} article={article} />)
          ) : (
            <EmptyState
              title="还没有可搜索的文章"
              description="等公开文章增加后，这里会自动参与搜索结果。"
            />
          )}
        </section>
      )}
    </PageShell>
  )
}
