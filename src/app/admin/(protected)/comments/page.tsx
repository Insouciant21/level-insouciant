import { approveCommentAction, deleteCommentAction, hideCommentAction } from "@/app/admin/actions"
import { Button } from "@/components/ui/button"
import { getAdminComments } from "@/lib/admin"

function formatCommentDate(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value))
}

export default async function AdminCommentsPage() {
  const comments = await getAdminComments()

  return (
    <section className="surface-panel px-6 py-6">
      <div className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Comment Moderation</p>
        <h1 className="text-2xl font-semibold tracking-tight">评论管理</h1>
        <p className="text-sm leading-7 text-muted-foreground">
          可以隐藏、恢复或删除评论。被隐藏的评论不会出现在文章页，也不会计入前台评论数。
        </p>
      </div>

      <div className="mt-6 grid gap-4">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <article key={comment.id} className="rounded-[1.75rem] border border-border/70 bg-background/50 px-5 py-5">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="font-semibold">{comment.authorName}</p>
                    <span className="rounded-full border border-border/70 px-3 py-1 text-xs text-muted-foreground">
                      {comment.status === "HIDDEN" ? "已隐藏" : "已公开"}
                    </span>
                    <span className="text-sm text-muted-foreground">{formatCommentDate(comment.createdAt)}</span>
                  </div>

                  <p className="mt-3 text-sm text-muted-foreground">文章：{comment.articleSlug}</p>
                  <p className="mt-4 whitespace-pre-line text-sm leading-7 text-foreground">{comment.content}</p>
                </div>

                <div className="flex flex-wrap gap-3 xl:max-w-xs xl:justify-end">
                  {comment.status === "HIDDEN" ? (
                    <form action={approveCommentAction}>
                      <input type="hidden" name="commentId" value={comment.id} />
                      <input type="hidden" name="slug" value={comment.articleSlug} />
                      <Button type="submit" className="rounded-full">
                        恢复显示
                      </Button>
                    </form>
                  ) : (
                    <form action={hideCommentAction}>
                      <input type="hidden" name="commentId" value={comment.id} />
                      <input type="hidden" name="slug" value={comment.articleSlug} />
                      <Button type="submit" variant="outline" className="rounded-full">
                        隐藏
                      </Button>
                    </form>
                  )}

                  <form action={deleteCommentAction}>
                    <input type="hidden" name="commentId" value={comment.id} />
                    <input type="hidden" name="slug" value={comment.articleSlug} />
                    <Button type="submit" variant="outline" className="rounded-full border-destructive/40 text-destructive">
                      删除
                    </Button>
                  </form>
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-3xl border border-dashed border-border px-4 py-8 text-sm text-muted-foreground">
            目前数据库中还没有评论数据。
          </div>
        )}
      </div>
    </section>
  )
}
