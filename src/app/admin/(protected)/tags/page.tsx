import { removeTagAction, renameTagAction } from "@/app/admin/actions"
import { Button } from "@/components/ui/button"
import { getManagedTags } from "@/lib/content-admin"

export default async function AdminTagsPage() {
  const tags = await getManagedTags()

  return (
    <section className="surface-panel px-6 py-6">
      <div className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Tag Operations</p>
        <h1 className="text-2xl font-semibold tracking-tight">标签管理</h1>
        <p className="text-sm leading-7 text-muted-foreground">
          标签依然来自 MDX frontmatter。这里支持批量重命名标签，或者从所有文章里移除某个标签。
        </p>
      </div>

      <div className="mt-6 grid gap-4">
        {tags.length > 0 ? (
          tags.map((tag) => (
            <article key={tag.name} className="rounded-[1.75rem] border border-border/70 bg-background/50 px-5 py-5">
              <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-lg font-semibold tracking-tight">{tag.name}</h2>
                    <span className="rounded-full border border-border/70 px-3 py-1 text-xs text-muted-foreground">
                      {tag.count} 篇文章
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">
                    关联文章：{tag.articleSlugs.join("、")}
                  </p>
                </div>

                <div className="grid gap-3 xl:min-w-[24rem]">
                  <form action={renameTagAction} className="flex flex-col gap-3 sm:flex-row">
                    <input type="hidden" name="sourceTag" value={tag.name} />
                    <input
                      type="text"
                      name="targetTag"
                      required
                      placeholder={`将 ${tag.name} 改成...`}
                      className="min-w-0 flex-1 rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none transition focus:border-primary/50"
                    />
                    <Button type="submit" variant="outline" className="rounded-full">
                      重命名
                    </Button>
                  </form>

                  <form action={removeTagAction}>
                    <input type="hidden" name="sourceTag" value={tag.name} />
                    <Button type="submit" variant="outline" className="rounded-full border-destructive/40 text-destructive">
                      从所有文章中移除
                    </Button>
                  </form>
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-3xl border border-dashed border-border px-4 py-8 text-sm text-muted-foreground">
            当前还没有可管理的标签。
          </div>
        )}
      </div>
    </section>
  )
}
