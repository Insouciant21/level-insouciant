import {
  approveCommentAction,
  deleteCommentAction,
  hideCommentAction,
} from "@/app/admin/actions"
import { Check, EyeOff, Trash2 } from "lucide-react"
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
    <section className="admin-surface p-4 sm:p-6">
      <div className="flex flex-col gap-2">
        <p className="admin-kicker">Comment Moderation</p>
        <h1 className="admin-title">评论管理</h1>
        <p className="admin-copy">
          可以隐藏、恢复或删除评论。对某条评论执行操作时，会同步作用到它下面的所有楼中楼回复。
        </p>
      </div>

      <div className="mt-6 grid gap-4">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <article
              key={comment.id}
              className="admin-surface-muted p-4 sm:p-5"
            >
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="font-semibold text-[#edf3e9]">
                      {comment.authorName}
                    </p>
                    <span
                      className={`admin-status-pill ${comment.status === "HIDDEN" ? "admin-status-draft" : "admin-status-live"}`}
                    >
                      {comment.status === "HIDDEN" ? "已隐藏" : "已公开"}
                    </span>
                    {comment.parentAuthorName ? (
                      <span className="admin-status-pill admin-status-muted">
                        回复 {comment.parentAuthorName}
                      </span>
                    ) : (
                      <span className="admin-status-pill admin-status-muted">
                        主评论
                      </span>
                    )}
                    {comment.repliesCount > 0 ? (
                      <span className="admin-status-pill admin-status-muted">
                        {comment.repliesCount} 条回复
                      </span>
                    ) : null}
                    <span className="text-xs text-[#748073]">
                      {formatCommentDate(comment.createdAt)}
                    </span>
                  </div>

                  <p className="mt-3 text-xs text-[#9aa79a]">
                    文章：{comment.articleSlug}
                  </p>
                  <p className="mt-4 text-sm leading-7 whitespace-pre-line text-[#dce6d8]">
                    {comment.content}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 xl:max-w-xs xl:justify-end">
                  {comment.status === "HIDDEN" ? (
                    <form action={approveCommentAction}>
                      <input
                        type="hidden"
                        name="commentId"
                        value={comment.id}
                      />
                      <input
                        type="hidden"
                        name="slug"
                        value={comment.articleSlug}
                      />
                      <Button type="submit" size="sm">
                        <Check className="size-3.5" aria-hidden="true" />
                        恢复显示
                      </Button>
                    </form>
                  ) : (
                    <form action={hideCommentAction}>
                      <input
                        type="hidden"
                        name="commentId"
                        value={comment.id}
                      />
                      <input
                        type="hidden"
                        name="slug"
                        value={comment.articleSlug}
                      />
                      <Button type="submit" variant="outline" size="sm">
                        <EyeOff className="size-3.5" aria-hidden="true" />
                        隐藏
                      </Button>
                    </form>
                  )}

                  <form action={deleteCommentAction}>
                    <input type="hidden" name="commentId" value={comment.id} />
                    <input
                      type="hidden"
                      name="slug"
                      value={comment.articleSlug}
                    />
                    <Button type="submit" variant="destructive" size="sm">
                      <Trash2 className="size-3.5" aria-hidden="true" />
                      删除
                    </Button>
                  </form>
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="admin-empty">目前数据库中还没有评论数据。</div>
        )}
      </div>
    </section>
  )
}
