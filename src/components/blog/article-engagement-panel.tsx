"use client"

import * as React from "react"
import Link from "next/link"
import { Eye, Heart, MessageSquare, SendHorizonal } from "lucide-react"

import { Button } from "@/components/ui/button"

type ArticleEngagementPanelProps = {
  slug: string
}

type EngagementSnapshot = {
  views: number
  likes: number
  commentsCount: number
  likedByViewer: boolean
  isAuthenticated: boolean
  currentUserName: string | null
}

type Comment = {
  id: string
  authorName: string
  content: string
  createdAt: string
}

function formatCommentDate(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value))
}

function ArticleEngagementPanel({ slug }: ArticleEngagementPanelProps) {
  const [snapshot, setSnapshot] = React.useState<EngagementSnapshot>({
    views: 0,
    likes: 0,
    commentsCount: 0,
    likedByViewer: false,
    isAuthenticated: false,
    currentUserName: null,
  })
  const [comments, setComments] = React.useState<Comment[]>([])
  const [content, setContent] = React.useState("")
  const [loading, setLoading] = React.useState(true)
  const [likePending, setLikePending] = React.useState(false)
  const [commentPending, setCommentPending] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    let active = true

    async function load() {
      try {
        const [engagementResponse, commentsResponse] = await Promise.all([
          fetch(`/api/articles/${slug}/engagement`, {
            cache: "no-store",
          }),
          fetch(`/api/articles/${slug}/comments`, {
            cache: "no-store",
          }),
        ])

        if (!active) {
          return
        }

        if (engagementResponse.ok) {
          const engagement = (await engagementResponse.json()) as EngagementSnapshot
          setSnapshot(engagement)
        }

        if (commentsResponse.ok) {
          const commentsPayload = (await commentsResponse.json()) as {
            comments: Comment[]
          }
          setComments(commentsPayload.comments)
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void load()

    return () => {
      active = false
    }
  }, [slug])

  React.useEffect(() => {
    const sessionKey = `insous:viewed:${slug}`

    if (window.sessionStorage.getItem(sessionKey)) {
      return
    }

    window.sessionStorage.setItem(sessionKey, "1")

    void fetch(`/api/articles/${slug}/engagement/view`, {
      method: "POST",
    })
      .then(async (response) => {
        if (!response.ok) {
          return null
        }

        return (await response.json()) as { views: number }
      })
      .then((payload) => {
        if (!payload) {
          return
        }

        setSnapshot((current) => ({
          ...current,
          views: payload.views,
        }))
      })
  }, [slug])

  async function handleToggleLike() {
    if (!snapshot.isAuthenticated) {
      setError("请先登录，再进行点赞。")
      return
    }

    setLikePending(true)
    setError(null)

    try {
      const response = await fetch(`/api/articles/${slug}/engagement/like`, {
        method: "POST",
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("AUTH_REQUIRED")
        }

        throw new Error("LIKE_FAILED")
      }

      const payload = (await response.json()) as {
        likes: number
        likedByViewer: boolean
      }

      setSnapshot((current) => ({
        ...current,
        likes: payload.likes,
        likedByViewer: payload.likedByViewer,
      }))
    } catch (likeError) {
      if (likeError instanceof Error && likeError.message === "AUTH_REQUIRED") {
        setError("请先登录，再进行点赞。")
      } else {
        setError("点赞失败，请稍后再试。")
      }
    } finally {
      setLikePending(false)
    }
  }

  async function handleSubmitComment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setCommentPending(true)
    setError(null)

    try {
      const response = await fetch(`/api/articles/${slug}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
        }),
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("AUTH_REQUIRED")
        }

        if (response.status === 503) {
          throw new Error("DATABASE_NOT_CONFIGURED")
        }

        throw new Error("COMMENT_FAILED")
      }

      const payload = (await response.json()) as {
        comment: Comment
      }

      setComments((current) => [payload.comment, ...current])
      setSnapshot((current) => ({
        ...current,
        commentsCount: current.commentsCount + 1,
      }))
      setContent("")
    } catch (submitError) {
      if (submitError instanceof Error) {
        if (submitError.message === "AUTH_REQUIRED") {
          setError("请先登录，再发表评论。")
        } else if (submitError.message === "DATABASE_NOT_CONFIGURED") {
          setError("数据库还没有配置好，评论暂时无法提交。")
        } else {
          setError("评论提交失败，请检查内容后重试。")
        }
      } else {
        setError("评论提交失败，请检查内容后重试。")
      }
    } finally {
      setCommentPending(false)
    }
  }

  const loginHref = `/login?next=${encodeURIComponent(`/articles/${slug}#article-engagement`)}`

  return (
    <section id="article-engagement" className="surface-panel mx-auto w-full max-w-4xl scroll-mt-28 px-6 py-6">
      <div className="flex flex-col gap-4 border-b border-border/60 pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="utility-kicker">Engagement</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">互动数据</h2>
          <p className="mt-2 text-sm leading-7 text-muted-foreground">
            游客只读。登录后的普通用户可以点赞和评论，管理员额外拥有后台内容管理权限。
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="chrome-pill">
            <span className="inline-flex items-center gap-2">
              <Eye className="size-4" />
              {loading ? "..." : snapshot.views} 次阅读
            </span>
          </div>

          {snapshot.isAuthenticated ? (
            <Button
              type="button"
              variant={snapshot.likedByViewer ? "default" : "outline"}
              size="sm"
              disabled={likePending}
              onClick={() => {
                void handleToggleLike()
              }}
            >
              <Heart className="size-4" />
              {snapshot.likes} 次点赞
            </Button>
          ) : (
            <div className="chrome-pill">
              <span className="inline-flex items-center gap-2">
                <Heart className="size-4" />
                {loading ? "..." : snapshot.likes} 次点赞
              </span>
            </div>
          )}

          <div className="chrome-pill">
            <span className="inline-flex items-center gap-2">
              <MessageSquare className="size-4" />
              {loading ? "..." : snapshot.commentsCount} 条评论
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.92fr)]">
        <div className="grid gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="utility-kicker">Field Notes</p>
              <h3 className="mt-2 text-lg font-semibold tracking-tight">最新评论</h3>
            </div>
            <span className="chrome-pill">{comments.length} 条已加载</span>
          </div>

          {comments.length > 0 ? (
            <div className="grid gap-3">
              {comments.map((comment) => (
                <article key={comment.id} className="dossier-paper px-5 py-5">
                  <div className="flex flex-col gap-3 border-b border-border/60 pb-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.22em] text-foreground/88">
                        {comment.authorName}
                      </p>
                      <p className="mt-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                        Comment Entry
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">{formatCommentDate(comment.createdAt)}</p>
                  </div>
                  <p className="mt-4 whitespace-pre-line break-words text-sm leading-7 text-foreground/78">
                    {comment.content}
                  </p>
                </article>
              ))}
            </div>
          ) : (
            <div className="dossier-paper border-dashed px-5 py-8 text-sm text-muted-foreground">
              还没有评论，欢迎留下第一条反馈。
            </div>
          )}
        </div>

        {snapshot.isAuthenticated ? (
          <div className="dossier-paper px-5 py-5">
            <div className="border-b border-border/60 pb-4">
              <p className="utility-kicker">Transmission</p>
              <h3 className="mt-2 text-lg font-semibold tracking-tight">写一条评论</h3>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                当前登录身份：{snapshot.currentUserName ?? "已登录用户"}。评论将以这个身份显示。
              </p>
            </div>

            <form className="mt-5 grid gap-4" onSubmit={handleSubmitComment}>
              <label className="grid gap-2">
                <span className="text-sm font-medium">评论内容</span>
                <textarea
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  maxLength={2000}
                  rows={6}
                  placeholder="欢迎分享你的想法、问题或者补充。"
                  className="field-textarea"
                />
              </label>

              {error ? (
                <div className="border-l-2 border-destructive bg-destructive/6 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              ) : null}

              <div className="flex items-center justify-between gap-3">
                <span className="chrome-pill">{content.length}/2000</span>
                <Button type="submit" size="sm" disabled={commentPending}>
                  <SendHorizonal className="size-4" />
                  {commentPending ? "提交中..." : "提交评论"}
                </Button>
              </div>
            </form>
          </div>
        ) : (
          <div className="dossier-paper border-dashed px-5 py-5">
            <div className="border-b border-border/60 pb-4">
              <p className="utility-kicker">Access Gate</p>
              <h3 className="mt-2 text-lg font-semibold tracking-tight">登录后参与互动</h3>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                游客只能查看评论、点赞数和阅读数。登录后的普通用户才能点赞与评论。
              </p>
            </div>

            {error ? (
              <div className="mt-4 border-l-2 border-destructive bg-destructive/6 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            ) : null}

            <div className="mt-5 flex flex-wrap gap-3">
              <Button asChild size="sm">
                <Link href={loginHref}>登录后评论</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href={loginHref}>登录后点赞</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export { ArticleEngagementPanel }
