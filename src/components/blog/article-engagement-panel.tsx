"use client"

import * as React from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import Link from "@/lib/navigation"
import { Eye, Heart, MessageSquare, SendHorizonal } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useMessage } from "@/components/ui/message-provider"
import { Textarea } from "@/components/ui/textarea"

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
  parentId: string | null
  replyToAuthorName: string | null
  replies: Comment[]
}

const outlineActionClass =
  "border-[#73766f]/55 bg-[#d9d1ad]/52 text-foreground shadow-[inset_0_1px_0_rgba(255,252,225,0.22),0_14px_26px_-24px_rgba(0,0,0,0.32)] hover:border-foreground/22 hover:bg-[#c6bd99]/62"
const primaryActionClass =
  "border-primary/65 bg-primary text-primary-foreground shadow-[inset_0_1px_0_rgba(255,252,225,0.22),0_14px_28px_-24px_rgba(0,0,0,0.32)] hover:border-primary/80 hover:bg-primary/85"
const fieldTextareaClass =
  "field-textarea rounded-none border-[#73766f]/55 bg-[#eee9d6]/62 text-foreground placeholder:text-muted-foreground/80 focus:border-foreground/35 focus:bg-[#eee9d6]/82"
const engagementPanelClass = "public-summary-panel"
const engagementCardClass = "public-summary-card"
const engagementChipClass =
  "public-summary-chip gap-2 border-[#73766f]/55 px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-foreground shadow-[inset_0_1px_0_rgba(255,252,225,0.2),0_12px_24px_-22px_rgba(0,0,0,0.3)]"

type CommentCardProps = {
  comment: Comment
  canReply: boolean
  activeReplyId: string | null
  replyContent: string
  replyPending: boolean
  replyError: string | null
  onReplyStart: (commentId: string) => void
  onReplyCancel: () => void
  onReplyContentChange: (value: string) => void
  onReplySubmit: (commentId: string) => void
}

function formatCommentDate(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value))
}

function countComments(comments: Comment[]): number {
  return comments.reduce(
    (total, comment) => total + 1 + countComments(comment.replies),
    0
  )
}

function insertComment(comments: Comment[], incoming: Comment): Comment[] {
  if (!incoming.parentId) {
    return [incoming, ...comments]
  }

  const [nextComments, inserted] = insertReply(
    comments,
    incoming.parentId,
    incoming
  )
  return inserted ? nextComments : [incoming, ...comments]
}

function insertReply(
  comments: Comment[],
  parentId: string,
  incoming: Comment
): [Comment[], boolean] {
  let inserted = false

  const nextComments = comments.map((comment) => {
    if (comment.id === parentId) {
      inserted = true
      return {
        ...comment,
        replies: [...comment.replies, incoming],
      }
    }

    const [nextReplies, replyInserted] = insertReply(
      comment.replies,
      parentId,
      incoming
    )

    if (!replyInserted) {
      return comment
    }

    inserted = true
    return {
      ...comment,
      replies: nextReplies,
    }
  })

  return [nextComments, inserted]
}

function getCommentErrorMessage(error: unknown) {
  if (error instanceof Error) {
    if (error.message === "AUTH_REQUIRED") {
      return "请先登录，再发表评论。"
    }

    if (error.message === "DATABASE_NOT_CONFIGURED") {
      return "数据库还没有配置好，评论暂时无法提交。"
    }

    if (error.message === "INVALID_REPLY_TARGET") {
      return "这条评论当前无法回复，请刷新页面后再试。"
    }

    if (error.message === "INVALID_COMMENT") {
      return "评论内容不能为空，请补充后再提交。"
    }
  }

  return "评论提交失败，请检查内容后重试。"
}

const EMPTY_ENGAGEMENT_SNAPSHOT: EngagementSnapshot = {
  views: 0,
  likes: 0,
  commentsCount: 0,
  likedByViewer: false,
  isAuthenticated: false,
  currentUserName: null,
}

type CommentSubmission = {
  content: string
  parentId?: string | null
}

type LikePayload = {
  likes: number
  likedByViewer: boolean
}

function engagementQueryKey(slug: string) {
  return ["article-engagement", slug] as const
}

function commentsQueryKey(slug: string) {
  return ["article-comments", slug] as const
}

async function fetchEngagement(slug: string): Promise<EngagementSnapshot> {
  const response = await fetch(`/api/articles/${slug}/engagement`, {
    cache: "no-store",
  })

  if (!response.ok) {
    return EMPTY_ENGAGEMENT_SNAPSHOT
  }

  return (await response.json()) as EngagementSnapshot
}

async function fetchComments(slug: string): Promise<Comment[]> {
  const response = await fetch(`/api/articles/${slug}/comments`, {
    cache: "no-store",
  })

  if (!response.ok) {
    return []
  }

  const payload = (await response.json()) as { comments: Comment[] }
  return payload.comments
}

async function toggleLike(slug: string): Promise<LikePayload> {
  const response = await fetch(`/api/articles/${slug}/engagement/like`, {
    method: "POST",
  })

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("AUTH_REQUIRED")
    }

    throw new Error("LIKE_FAILED")
  }

  return (await response.json()) as LikePayload
}

async function submitComment(
  slug: string,
  input: CommentSubmission
): Promise<{ comment: Comment }> {
  const response = await fetch(`/api/articles/${slug}/comments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  })

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as {
      error?: string
    } | null

    if (response.status === 401) {
      throw new Error("AUTH_REQUIRED")
    }

    if (payload?.error) {
      throw new Error(payload.error)
    }

    if (response.status === 503) {
      throw new Error("DATABASE_NOT_CONFIGURED")
    }

    throw new Error("COMMENT_FAILED")
  }

  return (await response.json()) as { comment: Comment }
}

function CommentCard({
  comment,
  canReply,
  activeReplyId,
  replyContent,
  replyPending,
  replyError,
  onReplyStart,
  onReplyCancel,
  onReplyContentChange,
  onReplySubmit,
}: CommentCardProps) {
  const isReplying = activeReplyId === comment.id

  return (
    <article className={`${engagementCardClass} px-5 py-5`}>
      <div className="flex flex-col gap-3 border-b border-border/55 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold tracking-[0.22em] text-foreground uppercase">
            {comment.authorName}
          </p>
          <p className="mt-1 text-xs tracking-[0.2em] text-muted-foreground uppercase">
            {comment.replyToAuthorName
              ? `Reply To ${comment.replyToAuthorName}`
              : "Comment Entry"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <p className="text-sm text-muted-foreground">
            {formatCommentDate(comment.createdAt)}
          </p>
          {canReply ? (
            isReplying ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className={outlineActionClass}
                onClick={onReplyCancel}
              >
                取消回复
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className={outlineActionClass}
                onClick={() => onReplyStart(comment.id)}
              >
                回复
              </Button>
            )
          ) : null}
        </div>
      </div>

      <p className="mt-4 text-sm leading-7 break-words whitespace-pre-line text-foreground/78">
        {comment.content}
      </p>

      {isReplying ? (
        <form
          method="post"
          className="mt-4 grid gap-4 border-t border-border/55 pt-4"
          onSubmit={(event) => {
            event.preventDefault()
            void onReplySubmit(comment.id)
          }}
        >
          <div className="grid gap-2">
            <Label htmlFor={`reply-${comment.id}`} className="text-foreground">
              回复 {comment.authorName}
            </Label>
            <Textarea
              id={`reply-${comment.id}`}
              value={replyContent}
              onChange={(event) => onReplyContentChange(event.target.value)}
              maxLength={2000}
              rows={4}
              placeholder={`回复 ${comment.authorName}...`}
              className={fieldTextareaClass}
            />
          </div>

          {replyError ? (
            <div className="border-l-2 border-destructive bg-destructive/6 px-4 py-3 text-sm text-destructive">
              {replyError}
            </div>
          ) : null}

          <div className="flex items-center justify-between gap-3">
            <span className={engagementChipClass}>
              {replyContent.length}/2000
            </span>
            <Button
              type="submit"
              size="sm"
              className={primaryActionClass}
              disabled={replyPending}
            >
              <SendHorizonal className="size-4" />
              {replyPending ? "提交中..." : "发送回复"}
            </Button>
          </div>
        </form>
      ) : null}

      {comment.replies.length > 0 ? (
        <div className="mt-4 grid gap-3 border-l border-border/55 pl-4 sm:pl-5">
          {comment.replies.map((reply) => (
            <CommentCard
              key={reply.id}
              comment={reply}
              canReply={canReply}
              activeReplyId={activeReplyId}
              replyContent={replyContent}
              replyPending={replyPending}
              replyError={replyError}
              onReplyStart={onReplyStart}
              onReplyCancel={onReplyCancel}
              onReplyContentChange={onReplyContentChange}
              onReplySubmit={onReplySubmit}
            />
          ))}
        </div>
      ) : null}
    </article>
  )
}

function ArticleEngagementPanel({ slug }: ArticleEngagementPanelProps) {
  const { showMessage } = useMessage()
  const queryClient = useQueryClient()
  const [content, setContent] = React.useState("")
  const [replyContent, setReplyContent] = React.useState("")
  const [activeReplyId, setActiveReplyId] = React.useState<string | null>(null)
  const [commentError, setCommentError] = React.useState<string | null>(null)
  const [replyError, setReplyError] = React.useState<string | null>(null)

  const engagementQuery = useQuery({
    queryKey: engagementQueryKey(slug),
    queryFn: () => fetchEngagement(slug),
  })
  const commentsQuery = useQuery({
    queryKey: commentsQueryKey(slug),
    queryFn: () => fetchComments(slug),
  })

  const snapshot = engagementQuery.data ?? EMPTY_ENGAGEMENT_SNAPSHOT
  const comments = commentsQuery.data ?? []
  const loading = engagementQuery.isPending || commentsQuery.isPending

  React.useEffect(() => {
    const sessionKey = `level-insouciant:viewed:${slug}`

    if (
      engagementQuery.isPending ||
      window.sessionStorage.getItem(sessionKey)
    ) {
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

        queryClient.setQueryData<EngagementSnapshot>(
          engagementQueryKey(slug),
          (current) => ({
            ...(current ?? EMPTY_ENGAGEMENT_SNAPSHOT),
            views: payload.views,
          })
        )
      })
  }, [engagementQuery.isPending, queryClient, slug])

  const likeMutation = useMutation<LikePayload, Error>({
    mutationFn: () => toggleLike(slug),
    onSuccess: (payload) => {
      queryClient.setQueryData<EngagementSnapshot>(
        engagementQueryKey(slug),
        (current) => ({
          ...(current ?? EMPTY_ENGAGEMENT_SNAPSHOT),
          likes: payload.likes,
          likedByViewer: payload.likedByViewer,
        })
      )
      showMessage({
        title: payload.likedByViewer ? "已记录点赞" : "已取消点赞",
        description: "互动数据已经同步。",
        tone: payload.likedByViewer ? "success" : "info",
      })
    },
    onError: (likeError) => {
      if (likeError.message === "AUTH_REQUIRED") {
        const message = "请先登录，再进行点赞。"
        setCommentError(message)
        showMessage({
          title: "互动未发送",
          description: message,
          tone: "warning",
        })
      } else {
        const message = "点赞失败，请稍后再试。"
        setCommentError(message)
        showMessage({
          title: "互动失败",
          description: message,
          tone: "error",
        })
      }
    },
  })

  const commentMutation = useMutation<
    { comment: Comment },
    Error,
    CommentSubmission
  >({
    mutationFn: (input) => submitComment(slug, input),
    onSuccess: (payload) => {
      queryClient.setQueryData<Comment[]>(commentsQueryKey(slug), (current) =>
        insertComment(current ?? [], payload.comment)
      )
      queryClient.setQueryData<EngagementSnapshot>(
        engagementQueryKey(slug),
        (current) => ({
          ...(current ?? EMPTY_ENGAGEMENT_SNAPSHOT),
          commentsCount: (current?.commentsCount ?? 0) + 1,
        })
      )
      setContent("")
      showMessage({
        title: "评论已提交",
        description: "评论已经写入当前文章的互动记录。",
        tone: "success",
      })
    },
    onError: (submitError) => {
      const message = getCommentErrorMessage(submitError)
      setCommentError(message)
      showMessage({
        title: "评论未提交",
        description: message,
        tone: "error",
      })
    },
  })

  const replyMutation = useMutation<
    { comment: Comment },
    Error,
    CommentSubmission
  >({
    mutationFn: (input) => submitComment(slug, input),
    onSuccess: (payload) => {
      queryClient.setQueryData<Comment[]>(commentsQueryKey(slug), (current) =>
        insertComment(current ?? [], payload.comment)
      )
      queryClient.setQueryData<EngagementSnapshot>(
        engagementQueryKey(slug),
        (current) => ({
          ...(current ?? EMPTY_ENGAGEMENT_SNAPSHOT),
          commentsCount: (current?.commentsCount ?? 0) + 1,
        })
      )
      setReplyContent("")
      setActiveReplyId(null)
      showMessage({
        title: "回复已提交",
        description: "回复已经加入当前评论线程。",
        tone: "success",
      })
    },
    onError: (submitError) => {
      const message = getCommentErrorMessage(submitError)
      setReplyError(message)
      showMessage({
        title: "回复未提交",
        description: message,
        tone: "error",
      })
    },
  })

  async function handleToggleLike() {
    if (!snapshot.isAuthenticated) {
      const message = "请先登录，再进行点赞。"
      setCommentError(message)
      showMessage({
        title: "互动未发送",
        description: message,
        tone: "warning",
      })
      return
    }

    setCommentError(null)
    setReplyError(null)
    likeMutation.mutate()
  }

  function handleSubmitComment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setCommentError(null)
    commentMutation.mutate({ content })
  }

  function handleSubmitReply(commentId: string) {
    setReplyError(null)
    replyMutation.mutate({
      content: replyContent,
      parentId: commentId,
    })
  }

  const loginHref = `/login?next=${encodeURIComponent(`/articles/${slug}#article-engagement`)}`
  const loadedCommentsCount = countComments(comments)

  return (
    <section
      id="article-engagement"
      className={`${engagementPanelClass} mx-auto w-full max-w-4xl scroll-mt-28 px-6 py-6 md:px-8 md:py-8`}
    >
      <div className="flex flex-col gap-4 border-b border-border/70 pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="utility-kicker">Engagement</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
            互动数据
          </h2>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className={engagementChipClass}>
            <span className="inline-flex items-center gap-2">
              <Eye className="size-4" />
              {loading ? "..." : snapshot.views} 次阅读
            </span>
          </div>

          <div className={engagementChipClass}>
            <span className="inline-flex items-center gap-2">
              <MessageSquare className="size-4" />
              {loading ? "..." : snapshot.commentsCount} 条评论
            </span>
          </div>

          {snapshot.isAuthenticated ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className={
                snapshot.likedByViewer ? primaryActionClass : outlineActionClass
              }
              disabled={likeMutation.isPending}
              onClick={() => {
                void handleToggleLike()
              }}
            >
              <Heart className="size-4" />
              {snapshot.likes} 次点赞
            </Button>
          ) : (
            <div className={engagementChipClass}>
              <span className="inline-flex items-center gap-2">
                <Heart className="size-4" />
                {loading ? "..." : snapshot.likes} 次点赞
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.92fr)]">
        <div className="grid gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="utility-kicker">Field Notes</p>
              <h3 className="mt-2 text-lg font-semibold tracking-tight text-foreground">
                最新评论
              </h3>
            </div>
            <span className={engagementChipClass}>
              {loadedCommentsCount} 条已加载
            </span>
          </div>

          {comments.length > 0 ? (
            <div className="grid gap-3">
              {comments.map((comment) => (
                <CommentCard
                  key={comment.id}
                  comment={comment}
                  canReply={snapshot.isAuthenticated}
                  activeReplyId={activeReplyId}
                  replyContent={replyContent}
                  replyPending={replyMutation.isPending}
                  replyError={replyError}
                  onReplyStart={(commentId) => {
                    setActiveReplyId(commentId)
                    setReplyContent("")
                    setReplyError(null)
                    setCommentError(null)
                  }}
                  onReplyCancel={() => {
                    setActiveReplyId(null)
                    setReplyContent("")
                    setReplyError(null)
                  }}
                  onReplyContentChange={(value) => {
                    setReplyContent(value)
                    if (replyError) {
                      setReplyError(null)
                    }
                  }}
                  onReplySubmit={handleSubmitReply}
                />
              ))}
            </div>
          ) : (
            <div
              className={`${engagementCardClass} border-dashed px-5 py-8 text-sm text-muted-foreground`}
            >
              还没有评论，欢迎留下第一条反馈。
            </div>
          )}
        </div>

        {snapshot.isAuthenticated ? (
          <div className={`${engagementCardClass} px-5 py-5`}>
            <div className="border-b border-border/55 pb-4">
              <p className="utility-kicker">Transmission</p>
              <h3 className="mt-2 text-lg font-semibold tracking-tight text-foreground">
                写一条评论
              </h3>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                当前登录身份：{snapshot.currentUserName ?? "已登录用户"}
                。评论将以这个身份显示。
              </p>
            </div>

            <form
              method="post"
              className="mt-5 grid gap-4"
              onSubmit={handleSubmitComment}
            >
              <div className="grid gap-2">
                <Label htmlFor="article-comment" className="text-foreground">
                  评论内容
                </Label>
                <Textarea
                  id="article-comment"
                  value={content}
                  onChange={(event) => {
                    setContent(event.target.value)
                    if (commentError) {
                      setCommentError(null)
                    }
                  }}
                  maxLength={2000}
                  rows={6}
                  placeholder="欢迎分享你的想法、问题或者补充。"
                  className={fieldTextareaClass}
                />
              </div>

              {commentError ? (
                <div className="border-l-2 border-destructive bg-destructive/6 px-4 py-3 text-sm text-destructive">
                  {commentError}
                </div>
              ) : null}

              <div className="flex items-center justify-between gap-3">
                <span className={engagementChipClass}>
                  {content.length}/2000
                </span>
                <Button
                  type="submit"
                  size="sm"
                  className={primaryActionClass}
                  disabled={commentMutation.isPending}
                >
                  <SendHorizonal className="size-4" />
                  {commentMutation.isPending ? "提交中..." : "提交评论"}
                </Button>
              </div>
            </form>
          </div>
        ) : (
          <div className={`${engagementCardClass} border-dashed px-5 py-5`}>
            <div className="border-b border-border/55 pb-4">
              <p className="utility-kicker">Access Gate</p>
              <h3 className="mt-2 text-lg font-semibold tracking-tight text-foreground">
                登录后参与互动
              </h3>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                游客只能查看评论、点赞数和阅读数。登录后才能点赞与评论。
              </p>
            </div>

            {commentError ? (
              <div className="mt-4 border-l-2 border-destructive bg-destructive/6 px-4 py-3 text-sm text-destructive">
                {commentError}
              </div>
            ) : null}

            <div className="mt-5 flex flex-wrap gap-3">
              <Button asChild size="sm" className={primaryActionClass}>
                <Link href={loginHref}>登录后评论</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="sm"
                className={outlineActionClass}
              >
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
