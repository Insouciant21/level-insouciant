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
    <section className="admin-surface px-6 py-6">
      <div className="flex flex-col gap-2">
        <p className="admin-kicker">Comment Moderation</p>
        <h1 className="admin-title">评论管理</h1>
        <p className="admin-copy">
          可以隐藏、恢复或删除评论。被隐藏的评论不会出现在文章页，也不会计入前台评论数。
        </p>
      </div>

      <div className="mt-6 grid gap-4">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <article key={comment.id} className="admin-surface-muted px-5 py-5">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="font-semibold text-[#f1eadb]">{comment.authorName}</p>
                    <span className={`admin-status-pill ${comment.status === "HIDDEN" ? "admin-status-draft" : "admin-status-live"}`}>
                      {comment.status === "HIDDEN" ? "已隐藏" : "已公开"}
                    </span>
                    <span className="text-sm text-[#8c9482]">{formatCommentDate(comment.createdAt)}</span>
                  </div>

                  <p className="mt-3 text-sm text-[#8c9482]">文章：{comment.articleSlug}</p>
                  <p className="mt-4 whitespace-pre-line text-sm leading-7 text-[#e7e0d0]">{comment.content}</p>
                </div>

                <div className="flex flex-wrap gap-3 xl:max-w-xs xl:justify-end">
                  {comment.status === "HIDDEN" ? (
                    <form action={approveCommentAction}>
                      <input type="hidden" name="commentId" value={comment.id} />
                      <input type="hidden" name="slug" value={comment.articleSlug} />
                      <Button type="submit">
                        恢复显示
                      </Button>
                    </form>
                  ) : (
                    <form action={hideCommentAction}>
                      <input type="hidden" name="commentId" value={comment.id} />
                      <input type="hidden" name="slug" value={comment.articleSlug} />
                      <Button type="submit" variant="outline">
                        隐藏
                      </Button>
                    </form>
                  )}

                  <form action={deleteCommentAction}>
                    <input type="hidden" name="commentId" value={comment.id} />
                    <input type="hidden" name="slug" value={comment.articleSlug} />
                    <Button type="submit" variant="destructive">
                      删除
                    </Button>
                  </form>
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="admin-empty">
            目前数据库中还没有评论数据。
          </div>
        )}
      </div>
    </section>
  )
}
