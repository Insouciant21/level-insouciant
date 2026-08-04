import Link from "next/link"
import {
  ExternalLink,
  FilePenLine,
  History,
  Plus,
  Send,
  Trash2,
  EyeOff,
} from "lucide-react"

import {
  deleteArticleAction,
  hideArticleAction,
  publishArticleAction,
} from "@/app/admin/actions"
import { Button } from "@/components/ui/button"
import { getManagedArticles } from "@/lib/content-admin"
import { formatDisplayDate } from "@/lib/content"

export default async function AdminArticlesPage() {
  const articles = await getManagedArticles()

  return (
    <section className="admin-surface p-4 sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-2">
          <p className="admin-kicker-accent">Article Control</p>
          <h1 className="admin-title">草稿与文章管理</h1>
          <p className="admin-copy">
            这里直接操作数据库中的文章记录，可以新建、编辑、发布、下线、查看修订历史或删除文章。
          </p>
        </div>

        <Button asChild className="w-full sm:w-auto">
          <Link href="/admin/articles/new">
            <Plus className="size-4" aria-hidden="true" />
            新建文章
          </Link>
        </Button>
      </div>

      <div className="mt-6 grid gap-4">
        {articles.map((article) => (
          <article
            key={article.slug}
            className="admin-surface-muted p-4 sm:p-5"
          >
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-lg font-semibold tracking-tight text-[#edf3e9] sm:text-xl">
                    {article.title}
                  </h2>
                  <span
                    className={`admin-status-pill ${article.draft ? "admin-status-draft" : "admin-status-live"}`}
                  >
                    {article.draft ? "草稿 / 已隐藏" : "已发布"}
                  </span>
                </div>

                <p className="admin-copy mt-3">{article.desc}</p>

                <div className="mt-4 grid gap-2 text-xs text-[#9aa79a] sm:grid-cols-2 xl:grid-cols-4">
                  <span>日期：{formatDisplayDate(article.date)}</span>
                  <span>分类：{article.category}</span>
                  <span className="min-w-0 break-all">
                    Slug：{article.slug}
                  </span>
                  {article.legacySourcePath ? (
                    <span className="min-w-0 break-all">
                      导入来源：{article.legacySourcePath}
                    </span>
                  ) : null}
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {article.tags.map((tag) => (
                    <span key={`${article.slug}-${tag}`} className="admin-chip">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="mt-4">
                  <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
                    <Link
                      href={`/admin/articles/${article.slug}/edit`}
                      className="admin-link inline-flex items-center gap-1.5"
                    >
                      <FilePenLine className="size-3.5" aria-hidden="true" />
                      编辑文章
                    </Link>
                    <Link
                      href={`/admin/articles/${article.slug}/history`}
                      className="admin-link inline-flex items-center gap-1.5"
                    >
                      <History className="size-3.5" aria-hidden="true" />
                      修订历史
                    </Link>
                    {!article.draft ? (
                      <Link
                        href={`/articles/${article.slug}`}
                        className="admin-link inline-flex items-center gap-1.5"
                      >
                        <ExternalLink className="size-3.5" aria-hidden="true" />
                        查看前台文章
                      </Link>
                    ) : (
                      <span className="text-[#748073]">当前为隐藏文章</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 xl:max-w-xs xl:justify-end">
                {article.draft ? (
                  <form action={publishArticleAction}>
                    <input type="hidden" name="slug" value={article.slug} />
                    <Button type="submit" size="sm">
                      <Send className="size-3.5" aria-hidden="true" />
                      发布
                    </Button>
                  </form>
                ) : (
                  <form action={hideArticleAction}>
                    <input type="hidden" name="slug" value={article.slug} />
                    <Button type="submit" variant="outline" size="sm">
                      <EyeOff className="size-3.5" aria-hidden="true" />
                      下线 / 隐藏
                    </Button>
                  </form>
                )}

                <form action={deleteArticleAction}>
                  <input type="hidden" name="slug" value={article.slug} />
                  <Button type="submit" variant="destructive" size="sm">
                    <Trash2 className="size-3.5" aria-hidden="true" />
                    删除
                  </Button>
                </form>
              </div>
            </div>
          </article>
        ))}

        {articles.length === 0 ? (
          <div className="admin-empty">
            数据库里还没有文章，先创建第一篇文章吧。
          </div>
        ) : null}
      </div>
    </section>
  )
}
