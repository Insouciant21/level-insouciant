import Link from "@/lib/navigation"
import {
  BarChart3,
  FileCheck2,
  Eye,
  MessageCircle,
  Tag,
  ThumbsUp,
  Users,
} from "lucide-react"
import { AdminStatCard } from "@/components/admin/admin-stat-card"
import {
  MotionReveal,
  MotionStagger,
  MotionStaggerItem,
} from "@/components/motion/page-transition"
import { formatDisplayDate } from "@/lib/content-presentation"

import type { load } from "@/server/pages/admin-dashboard-index"
import { IslandProvider } from "@/components/providers/island-provider"
function View({
  overview,
  drafts,
  topArticles,
}: Awaited<ReturnType<typeof load>>) {
  return (
    <div className="grid gap-8">
      <MotionReveal variant="fade">
        <header className="border-b border-white/10 pb-6">
          <p className="admin-kicker-accent">Operations Console</p>
          <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-[#edf3e9] sm:text-4xl">
                后台概览
              </h1>
            </div>
            <span className="admin-status-pill admin-status-live">
              <span className="size-1.5 rounded-full bg-[var(--safety-exit-green)]" />
              系统正常
            </span>
          </div>
        </header>
      </MotionReveal>

      <MotionStagger
        className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
        delay={0.1}
        stagger={0.08}
      >
        <MotionStaggerItem variant="fade">
          <AdminStatCard
            icon={FileCheck2}
            label="已发布文章"
            value={String(overview.publishedCount)}
            hint="面向前台公开展示"
          />
        </MotionStaggerItem>
        <MotionStaggerItem variant="fade">
          <AdminStatCard
            icon={BarChart3}
            label="草稿文章"
            value={String(overview.draftCount)}
            hint="仍在编辑或隐藏中"
          />
        </MotionStaggerItem>
        <MotionStaggerItem variant="fade">
          <AdminStatCard
            icon={Eye}
            label="全部阅读量"
            value={String(overview.totalViews)}
            hint="累计 page views"
          />
        </MotionStaggerItem>
        <MotionStaggerItem variant="fade">
          <AdminStatCard
            icon={MessageCircle}
            label="全部评论数"
            value={String(overview.totalComments)}
            hint={`隐藏评论 ${overview.hiddenComments} 条`}
          />
        </MotionStaggerItem>
      </MotionStagger>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <MotionReveal variant="fade" delay={0.15}>
          <article className="admin-surface px-5 py-5 sm:px-6 sm:py-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="admin-kicker">Draft Queue</p>
                <h2 className="mt-2 text-xl font-semibold tracking-tight text-[#edf3e9] sm:text-2xl">
                  草稿队列
                </h2>
              </div>
              <Link href="/admin/articles" className="admin-link">
                查看全部
              </Link>
            </div>

            <div className="mt-5 grid gap-3">
              {drafts.length > 0 ? (
                drafts.map((article) => (
                  <div
                    key={article.slug}
                    className="border-b border-white/10 py-4 first:pt-0 last:border-b-0 last:pb-0"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-medium text-[#edf3e9]">
                          {article.title}
                        </p>
                        <p className="admin-copy mt-2">{article.desc}</p>
                      </div>
                      <span className="admin-status-pill admin-status-draft">
                        草稿
                      </span>
                    </div>
                    <p className="mt-3 text-xs text-[#748073]">
                      {formatDisplayDate(article.date)}
                    </p>
                  </div>
                ))
              ) : (
                <div className="admin-empty">
                  当前没有草稿，所有文章都已公开。
                </div>
              )}
            </div>
          </article>
        </MotionReveal>

        <MotionReveal variant="fade" delay={0.25}>
          <article className="admin-surface-muted px-5 py-5 sm:px-6 sm:py-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="admin-kicker">Top Content</p>
                <h2 className="mt-2 text-xl font-semibold tracking-tight text-[#edf3e9] sm:text-2xl">
                  热门文章
                </h2>
              </div>
              <Link href="/admin/stats" className="admin-link">
                查看统计详情
              </Link>
            </div>

            <div className="mt-5 grid gap-3">
              {topArticles.map((article) => (
                <div
                  key={article.slug}
                  className="border-b border-white/10 py-4 first:pt-0 last:border-b-0 last:pb-0"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-[#edf3e9]">
                        {article.title}
                      </p>
                      <p className="admin-copy mt-2">
                        {article.views} 阅读 · {article.likes} 点赞 ·{" "}
                        {article.comments} 评论
                      </p>
                    </div>
                    <span
                      className={`admin-status-pill ${article.draft ? "admin-status-draft" : "admin-status-muted"}`}
                    >
                      {article.draft ? "隐藏中" : "公开中"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </MotionReveal>
      </section>

      <MotionStagger
        className="grid gap-4 md:grid-cols-3"
        delay={0.2}
        stagger={0.08}
      >
        <MotionStaggerItem variant="fade">
          <AdminStatCard
            icon={Tag}
            label="标签主题"
            value={String(overview.tagsCount)}
            hint="草稿与公开文章一并统计"
          />
        </MotionStaggerItem>
        <MotionStaggerItem variant="fade">
          <AdminStatCard
            icon={ThumbsUp}
            label="累计点赞"
            value={String(overview.totalLikes)}
            hint="按文章聚合"
          />
        </MotionStaggerItem>
        <MotionStaggerItem variant="fade">
          <AdminStatCard
            icon={Users}
            label="账号数"
            value={String(overview.usersCount)}
            hint="当前数据库中的已建账号"
          />
        </MotionStaggerItem>
      </MotionStagger>
    </div>
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
