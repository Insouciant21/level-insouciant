import { removeTagAction, renameTagAction } from "@/app/admin/actions"
import { Button } from "@/components/ui/button"
import { getManagedTags } from "@/lib/content-admin"

export default async function AdminTagsPage() {
  const tags = await getManagedTags()

  return (
    <section className="admin-surface px-6 py-6">
      <div className="flex flex-col gap-2">
        <p className="admin-kicker">Tag Operations</p>
        <h1 className="admin-title">标签管理</h1>
        <p className="admin-copy">
          标签现在来自数据库中的文章记录。这里支持批量重命名标签，或者从所有文章里移除某个标签。
        </p>
      </div>

      <div className="mt-6 grid gap-4">
        {tags.length > 0 ? (
          tags.map((tag) => (
            <article key={tag.name} className="admin-surface-muted px-5 py-5">
              <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-lg font-semibold tracking-tight text-[#f1eadb]">{tag.name}</h2>
                    <span className="admin-status-pill admin-status-muted">
                      {tag.count} 篇文章
                    </span>
                  </div>
                  <p className="admin-copy mt-3">
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
                      className="admin-input min-w-0 flex-1"
                    />
                    <Button type="submit" variant="outline">
                      重命名
                    </Button>
                  </form>

                  <form action={removeTagAction}>
                    <input type="hidden" name="sourceTag" value={tag.name} />
                    <Button type="submit" variant="destructive">
                      从所有文章中移除
                    </Button>
                  </form>
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="admin-empty">
            当前还没有可管理的标签。
          </div>
        )}
      </div>
    </section>
  )
}
