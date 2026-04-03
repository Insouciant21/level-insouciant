import Link from "next/link"

import { AdminStatCard } from "@/components/admin/admin-stat-card"
import { getDashboardOverview, getArticleStats } from "@/lib/admin"
import { formatDisplayDate } from "@/lib/content"

export default async function AdminDashboardPage() {
  const [overview, articleStats] = await Promise.all([getDashboardOverview(), getArticleStats()])
  const drafts = articleStats.filter((article) => article.draft).slice(0, 5)
  const topArticles = articleStats.slice(0, 5)

  return (
    <div className="grid gap-8">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard label="已发布文章" value={String(overview.publishedCount)} hint="面向前台公开展示" />
        <AdminStatCard label="草稿文章" value={String(overview.draftCount)} hint="仍在编辑或隐藏中" />
        <AdminStatCard label="全部阅读量" value={String(overview.totalViews)} hint="累计 page views" />
        <AdminStatCard label="全部评论数" value={String(overview.totalComments)} hint={`隐藏评论 ${overview.hiddenComments} 条`} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <article className="surface-panel px-6 py-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Draft Queue</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">草稿队列</h2>
            </div>
            <Link href="/admin/articles" className="text-sm text-primary underline underline-offset-4">
              查看全部
            </Link>
          </div>

          <div className="mt-5 grid gap-3">
            {drafts.length > 0 ? (
              drafts.map((article) => (
                <div key={article.slug} className="rounded-3xl border border-border/70 bg-background/50 px-4 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium">{article.title}</p>
                      <p className="mt-2 text-sm text-muted-foreground">{article.desc}</p>
                    </div>
                    <span className="rounded-full border border-border/70 px-3 py-1 text-xs text-muted-foreground">
                      草稿
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">{formatDisplayDate(article.date)}</p>
                </div>
              ))
            ) : (
              <div className="rounded-3xl border border-dashed border-border px-4 py-8 text-sm text-muted-foreground">
                当前没有草稿，所有文章都已公开。
              </div>
            )}
          </div>
        </article>

        <article className="surface-panel px-6 py-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Top Content</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">热门文章</h2>
            </div>
            <Link href="/admin/stats" className="text-sm text-primary underline underline-offset-4">
              查看统计详情
            </Link>
          </div>

          <div className="mt-5 grid gap-3">
            {topArticles.map((article) => (
              <div key={article.slug} className="rounded-3xl border border-border/70 bg-background/50 px-4 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium">{article.title}</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {article.views} 阅读 · {article.likes} 点赞 · {article.comments} 评论
                    </p>
                  </div>
                  <span className="rounded-full border border-border/70 px-3 py-1 text-xs text-muted-foreground">
                    {article.draft ? "隐藏中" : "公开中"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <AdminStatCard label="标签主题" value={String(overview.tagsCount)} hint="草稿与公开文章一并统计" />
        <AdminStatCard label="累计点赞" value={String(overview.totalLikes)} hint="按文章聚合" />
        <AdminStatCard label="账号数" value={String(overview.usersCount)} hint="当前数据库中的已建账号" />
      </section>
    </div>
  )
}
