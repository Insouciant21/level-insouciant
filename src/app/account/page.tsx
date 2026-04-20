import type { Metadata } from "next"
import Link from "next/link"

import {
  changePasswordAction,
  deleteOwnCommentAction,
  updateProfileAction,
} from "@/app/account/actions"
import { PageShell } from "@/components/blog/page-shell"
import { Button } from "@/components/ui/button"
import { getAccountProfile, getOwnComments } from "@/lib/account"
import { requireUser } from "@/lib/auth"
import { createPageMetadata } from "@/lib/seo"

type AccountPageProps = {
  searchParams: Promise<{
    profile?: string
    password?: string
    comment?: string
    error?: string
  }>
}

const errorMessages: Record<string, string> = {
  DATABASE_NOT_CONFIGURED: "数据库尚未配置完成，账号信息暂时无法修改。",
  INVALID_PROFILE_INPUT: "请至少填写有效邮箱后再保存资料。",
  EMAIL_TAKEN: "这个邮箱已经被其他账号占用。",
  INVALID_PASSWORD_INPUT: "新密码至少需要 8 位字符。",
  PASSWORD_CONFIRM_MISMATCH: "两次输入的新密码不一致。",
  INVALID_CURRENT_PASSWORD: "原密码验证失败。",
  COMMENT_NOT_FOUND: "这条评论不存在或已经被删除。",
  FORBIDDEN: "你只能管理自己发出的评论。",
}

export const metadata: Metadata = createPageMetadata({
  title: "我的资料",
  description: "管理个人资料、密码和评论。",
  path: "/account",
  noIndex: true,
})

function getNotice(params: Awaited<AccountPageProps["searchParams"]>) {
  if (params.profile) {
    return "个人资料已更新。"
  }

  if (params.password) {
    return "密码已更新。"
  }

  if (params.comment) {
    return "评论已删除。"
  }

  if (params.error) {
    return errorMessages[params.error] ?? "操作失败，请稍后再试。"
  }

  return null
}

function formatCommentDate(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value))
}

export default async function AccountPage({ searchParams }: AccountPageProps) {
  const user = await requireUser()
  const [profile, comments, params] = await Promise.all([
    getAccountProfile(user.id),
    getOwnComments(user.id),
    searchParams,
  ])

  if (!profile) {
    return null
  }

  const notice = getNotice(params)
  const initials = (profile.name || profile.email).slice(0, 1).toUpperCase()

  return (
    <PageShell>
      <section className="dossier-paper px-6 py-6 sm:px-7">
        <div className="flex flex-col gap-4 border-b border-border/60 pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="utility-kicker">Account Center</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">我的资料</h1>
          </div>

          {user.role === "ADMIN" ? (
            <Button asChild variant="outline" size="sm" className="justify-center">
              <Link href="/admin/dashboard">返回后台</Link>
            </Button>
          ) : null}
        </div>

        {notice ? <p className="mt-5 text-sm text-muted-foreground">{notice}</p> : null}

        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
          <div className="grid gap-6">
            <section className="border border-border/70 bg-background/50 px-5 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]">
              <div className="flex items-start gap-4">
                <div
                  className="flex size-16 shrink-0 items-center justify-center border border-border/70 bg-muted text-lg font-semibold text-foreground"
                  style={profile.avatarUrl ? { backgroundImage: `url(${profile.avatarUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
                >
                  {!profile.avatarUrl ? initials : null}
                </div>

                <div>
                  <p className="text-lg font-semibold">{profile.name || "未设置昵称"}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{profile.email}</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    身份：{profile.role === "ADMIN" ? "管理员" : "普通用户"}
                  </p>
                </div>
              </div>
            </section>

            <section className="border border-border/70 bg-background/50 px-5 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]">
              <div className="mb-5">
                <p className="utility-kicker">Profile</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">基本信息</h2>
              </div>

              <form action={updateProfileAction} className="grid gap-4">
                <label className="grid gap-2">
                  <span className="text-sm font-medium">昵称</span>
                  <input
                    type="text"
                    name="name"
                    defaultValue={profile.name ?? ""}
                    placeholder="输入显示给其他人的昵称"
                    className="field-input"
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-medium">邮箱</span>
                  <input
                    type="email"
                    name="email"
                    required
                    defaultValue={profile.email}
                    className="field-input"
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-medium">头像链接</span>
                  <input
                    type="url"
                    name="avatarUrl"
                    defaultValue={profile.avatarUrl ?? ""}
                    placeholder="https://example.com/avatar.jpg"
                    className="field-input"
                  />
                </label>

                <Button type="submit" className="mt-2 w-full justify-center sm:w-fit">
                  保存资料
                </Button>
              </form>
            </section>

            <section className="border border-border/70 bg-background/50 px-5 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]">
              <div className="mb-5">
                <p className="utility-kicker">Security</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">修改密码</h2>
              </div>

              <form action={changePasswordAction} className="grid gap-4">
                <label className="grid gap-2">
                  <span className="text-sm font-medium">原密码</span>
                  <input
                    type="password"
                    name="currentPassword"
                    required
                    className="field-input"
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-medium">新密码</span>
                  <input
                    type="password"
                    name="nextPassword"
                    required
                    minLength={8}
                    className="field-input"
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-medium">确认新密码</span>
                  <input
                    type="password"
                    name="confirmPassword"
                    required
                    minLength={8}
                    className="field-input"
                  />
                </label>

                <Button type="submit" className="mt-2 w-full justify-center sm:w-fit">
                  更新密码
                </Button>
              </form>
            </section>
          </div>

          <section className="border border-border/70 bg-background/50 px-5 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="utility-kicker">My Comments</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">我的评论</h2>
              </div>
              <span className="border border-border/70 px-3 py-1 text-xs text-muted-foreground">
                {comments.length} 条
              </span>
            </div>

            <div className="mt-5 grid gap-4">
              {comments.length > 0 ? (
                comments.map((comment) => (
                  <article
                    key={comment.id}
                    className="border border-border/70 bg-card/70 px-4 py-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="font-medium">
                          {comment.articleTitle ?? comment.articleSlug}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {formatCommentDate(comment.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="border border-border/70 px-3 py-1 text-xs text-muted-foreground">
                          {comment.status === "HIDDEN" ? "已隐藏" : "已公开"}
                        </span>
                        <Button asChild variant="outline" size="sm" className="justify-center">
                          <Link href={`/articles/${comment.articleSlug}#article-engagement`}>查看文章</Link>
                        </Button>
                      </div>
                    </div>

                    <p className="mt-4 whitespace-pre-line text-sm leading-7 text-muted-foreground">
                      {comment.content}
                    </p>

                    <form action={deleteOwnCommentAction} className="mt-4">
                      <input type="hidden" name="commentId" value={comment.id} />
                      <Button type="submit" variant="destructive" size="sm" className="justify-center">
                        删除这条评论
                      </Button>
                    </form>
                  </article>
                ))
              ) : (
                <div className="rounded-3xl border border-dashed border-border px-4 py-8 text-sm text-muted-foreground">
                  你还没有发出过评论。
                </div>
              )}
            </div>
          </section>
        </div>
      </section>
    </PageShell>
  )
}
