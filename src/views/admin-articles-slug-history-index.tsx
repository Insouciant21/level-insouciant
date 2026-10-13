import Link from "@/lib/navigation"
import { ArrowLeft, ExternalLink, RotateCcw } from "lucide-react"
import { restoreArticleRevisionAction } from "@/lib/action-links"
import { AdminRevisionBodyDetails } from "@/components/admin/admin-revision-body-details"
import { Button } from "@/components/ui/button"
import { formatDisplayDate } from "@/lib/content-presentation"
function formatRevisionDate(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value))
}
import type { load } from "@/server/pages/admin-articles-slug-history-index"
import { IslandProvider } from "@/components/providers/island-provider"
function View({
  article,
  revisions,
  message,
}: Awaited<ReturnType<typeof load>>) {
  return (
    <section className="admin-surface p-4 sm:p-6">
      <div className="flex flex-col gap-4 border-b border-white/10 pb-5">
        <div className="flex flex-wrap items-center gap-3">
          <p className="admin-kicker-accent">Revision History</p>
          <span
            className={`admin-status-pill ${article.draft ? "admin-status-draft" : "admin-status-live"}`}
          >
            {article.draft ? "草稿 / 已隐藏" : "已发布"}
          </span>
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <h1 className="admin-title">{article.title}</h1>

          <div className="flex flex-wrap gap-4 text-sm">
            <Link
              href={`/admin/articles/${article.slug}/edit`}
              className="admin-link inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="size-3.5" aria-hidden="true" />
              返回编辑页
            </Link>
            {!article.draft ? (
              <Link
                href={`/articles/${article.slug}`}
                className="admin-link inline-flex items-center gap-1.5"
              >
                <ExternalLink className="size-3.5" aria-hidden="true" />
                查看前台文章
              </Link>
            ) : null}
          </div>
        </div>

        <div className="grid gap-2 text-xs text-[#9aa79a] sm:grid-cols-2 xl:grid-cols-4">
          <span className="break-all">Slug：{article.slug}</span>
          <span>分类：{article.category}</span>
          <span>发布日期：{formatDisplayDate(article.date)}</span>
          <span>当前修订数：{revisions.length}</span>
        </div>

        {message ? <p className="admin-copy">{message}</p> : null}
      </div>

      <div className="mt-6 grid gap-4">
        {revisions.length > 0 ? (
          revisions.map((revision) => (
            <article
              key={revision.id}
              className="admin-surface-muted p-4 sm:p-5"
            >
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-lg font-semibold tracking-tight text-[#edf3e9]">
                      {revision.title}
                    </h2>
                    <span
                      className={`admin-status-pill ${revision.draft ? "admin-status-draft" : "admin-status-live"}`}
                    >
                      {revision.draft ? "草稿 / 已隐藏" : "已发布"}
                    </span>
                    <span className="text-xs text-[#748073]">
                      {formatRevisionDate(revision.createdAt)}
                    </span>
                  </div>

                  <p className="admin-copy mt-3">{revision.desc}</p>

                  <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-[#9aa79a]">
                    <span>
                      编辑者：{revision.createdByName ?? "系统 / 未知用户"}
                    </span>
                    <span>
                      文章日期：{formatDisplayDate(revision.publishedAt)}
                    </span>
                    {revision.reason ? (
                      <span>原因：{revision.reason}</span>
                    ) : null}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {revision.tags.map((tag) => (
                      <span
                        key={`${revision.id}-${tag}`}
                        className="admin-chip"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <AdminRevisionBodyDetails
                    contentUrl={`/api/admin/articles/${encodeURIComponent(article.slug)}/revisions/${encodeURIComponent(revision.id)}`}
                  />
                </div>

                <form
                  method="post"
                  action={restoreArticleRevisionAction}
                  className="xl:shrink-0"
                >
                  <input type="hidden" name="slug" value={article.slug} />
                  <input type="hidden" name="revisionId" value={revision.id} />
                  <Button type="submit" variant="outline" size="sm">
                    <RotateCcw className="size-3.5" aria-hidden="true" />
                    恢复这个版本
                  </Button>
                </form>
              </div>
            </article>
          ))
        ) : (
          <div className="admin-empty">这篇文章暂时还没有修订历史。</div>
        )}
      </div>
    </section>
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
