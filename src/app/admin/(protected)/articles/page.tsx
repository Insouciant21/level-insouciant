import Link from "next/link"

import { deleteArticleAction, hideArticleAction, publishArticleAction } from "@/app/admin/actions"
import { Button } from "@/components/ui/button"
import { getManagedArticles } from "@/lib/content-admin"
import { formatDisplayDate } from "@/lib/content"

export default async function AdminArticlesPage() {
  const articles = await getManagedArticles()

  return (
    <section className="surface-panel px-6 py-6">
      <div className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Article Control</p>
        <h1 className="text-2xl font-semibold tracking-tight">草稿与文章管理</h1>
        <p className="text-sm leading-7 text-muted-foreground">
          这里直接操作 `content/articles` 里的 MDX 文件，可以发布、下线或删除文章。
        </p>
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
                  <Link
                    href={article.draft ? `/admin/articles` : `/articles/${article.slug}`}
                    className="text-sm text-primary underline underline-offset-4"
                  >
                    {article.draft ? "当前为隐藏文章" : "查看前台文章"}
                  </Link>
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
      </div>
    </section>
  )
}
