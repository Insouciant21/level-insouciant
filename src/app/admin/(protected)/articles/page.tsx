import Link from "next/link"

import { deleteArticleAction, hideArticleAction, publishArticleAction } from "@/app/admin/actions"
import { Button } from "@/components/ui/button"
import { getManagedArticles } from "@/lib/content-admin"
import { formatDisplayDate } from "@/lib/content"

export default async function AdminArticlesPage() {
  const articles = await getManagedArticles()

  return (
    <section className="surface-panel px-6 py-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-2">
          <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Article Control</p>
          <h1 className="text-2xl font-semibold tracking-tight">草稿与文章管理</h1>
          <p className="text-sm leading-7 text-muted-foreground">
            这里直接操作数据库中的文章记录，可以新建、编辑、发布、下线、查看修订历史或删除文章。
          </p>
        </div>

        <Button asChild className="rounded-full">
          <Link href="/admin/articles/new">新建文章</Link>
        </Button>
      </div>

      <div className="mt-6 grid gap-4">
        {articles.map((article) => (
          <article key={article.slug} className="rounded-[1.75rem] border border-border/70 bg-background/50 px-5 py-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-xl font-semibold tracking-tight">{article.title}</h2>
                  <span className="rounded-full border border-border/70 px-3 py-1 text-xs text-muted-foreground">
                    {article.draft ? "草稿 / 已隐藏" : "已发布"}
                  </span>
                </div>

                <p className="mt-3 text-sm leading-7 text-muted-foreground">{article.desc}</p>

                <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                  <span>日期：{formatDisplayDate(article.date)}</span>
                  <span>分类：{article.category}</span>
                  <span>Slug：{article.slug}</span>
                  {article.legacySourcePath ? <span>导入来源：{article.legacySourcePath}</span> : null}
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {article.tags.map((tag) => (
                    <span
                      key={`${article.slug}-${tag}`}
                      className="rounded-full border border-border/70 bg-muted/35 px-3 py-1 text-xs text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="mt-4">
                  <div className="flex flex-wrap gap-4 text-sm">
                    <Link
                      href={`/admin/articles/${article.slug}/edit`}
                      className="text-primary underline underline-offset-4"
                    >
                      编辑文章
                    </Link>
                    <Link
                      href={`/admin/articles/${article.slug}/history`}
                      className="text-primary underline underline-offset-4"
                    >
                      修订历史
                    </Link>
                    {!article.draft ? (
                      <Link href={`/articles/${article.slug}`} className="text-primary underline underline-offset-4">
                        查看前台文章
                      </Link>
                    ) : (
                      <span className="text-muted-foreground">当前为隐藏文章</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 xl:max-w-xs xl:justify-end">
                {article.draft ? (
                  <form action={publishArticleAction}>
                    <input type="hidden" name="slug" value={article.slug} />
                    <Button type="submit" className="rounded-full">
                      发布
                    </Button>
                  </form>
                ) : (
                  <form action={hideArticleAction}>
                    <input type="hidden" name="slug" value={article.slug} />
                    <Button type="submit" variant="outline" className="rounded-full">
                      下线 / 隐藏
                    </Button>
                  </form>
                )}

                <form action={deleteArticleAction}>
                  <input type="hidden" name="slug" value={article.slug} />
                  <Button type="submit" variant="outline" className="rounded-full border-destructive/40 text-destructive">
                    删除
                  </Button>
                </form>
              </div>
            </div>
          </article>
        ))}

        {articles.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border px-4 py-8 text-sm text-muted-foreground">
            数据库里还没有文章，先创建第一篇文章吧。
          </div>
        ) : null}
      </div>
    </section>
  )
}
