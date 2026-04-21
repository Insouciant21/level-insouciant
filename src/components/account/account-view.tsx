import Link from "next/link"

import {
  changePasswordAction,
  deleteOwnCommentAction,
  updateProfileAction,
} from "@/app/account/actions"
import { PageShell } from "@/components/blog/page-shell"
import { Button } from "@/components/ui/button"
import type { AccountCommentItem, AccountProfile } from "@/lib/account"
import { formatAccountCommentDate } from "@/lib/account-page"

type AccountViewProps = {
  profile: AccountProfile
  comments: AccountCommentItem[]
  notice: string | null
}

export function UserAccountView({ profile, comments, notice }: AccountViewProps) {
  const initials = (profile.name || profile.email).slice(0, 1).toUpperCase()

  return (
    <PageShell>
      <section className="dossier-paper px-6 py-6 sm:px-7">
        <div className="flex flex-col gap-4 border-b border-border/60 pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="utility-kicker">Account Center</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">我的资料</h1>
          </div>
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
                  <p className="mt-2 text-sm text-muted-foreground">身份：普通用户</p>
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
                        {comment.replyToAuthorName ? (
                          <p className="mt-1 text-sm text-muted-foreground">
                            回复给 {comment.replyToAuthorName}
                          </p>
                        ) : null}
                        <p className="mt-1 text-sm text-muted-foreground">
                          {formatAccountCommentDate(comment.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="border border-border/70 px-3 py-1 text-xs text-muted-foreground">
                          {comment.status === "HIDDEN" ? "已隐藏" : "已公开"}
                        </span>
                        {comment.repliesCount > 0 ? (
                          <span className="border border-border/70 px-3 py-1 text-xs text-muted-foreground">
                            {comment.repliesCount} 条回复
                          </span>
                        ) : null}
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
                      <Button
                        type="submit"
                        variant={comment.repliesCount > 0 ? "outline" : "destructive"}
                        size="sm"
                        className="justify-center"
                        disabled={comment.repliesCount > 0}
                      >
                        {comment.repliesCount > 0 ? "已有回复，暂不可删除" : "删除这条评论"}
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

export function AdminAccountView({ profile, comments, notice }: AccountViewProps) {
  const initials = (profile.name || profile.email).slice(0, 1).toUpperCase()

  return (
    <section className="admin-surface px-6 py-6">
      <div className="flex flex-col gap-4 border-b border-white/10 pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="admin-kicker-accent">Account Console</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#f2eadb]">我的资料</h1>
          <p className="admin-copy mt-2">管理管理员账号资料、密码，以及你在站内留下的评论记录。</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="admin-status-pill admin-status-live">
            <span className="size-1.5 bg-[#77d490]" />
            Admin Session
          </span>
        </div>
      </div>

      {notice ? <p className="admin-copy mt-5">{notice}</p> : null}

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <div className="grid gap-6">
          <section className="admin-surface-muted px-5 py-5">
            <div className="flex items-start gap-4">
              <div
                className="flex size-16 shrink-0 items-center justify-center border border-[#4a5244] bg-[#1a1d1a] text-lg font-semibold text-[#f1eadb]"
                style={profile.avatarUrl ? { backgroundImage: `url(${profile.avatarUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
              >
                {!profile.avatarUrl ? initials : null}
              </div>

              <div className="min-w-0">
                <p className="text-lg font-semibold text-[#f1eadb]">{profile.name || "未设置昵称"}</p>
                <p className="mt-1 break-all text-sm text-[#8c9482]">{profile.email}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="admin-status-pill admin-status-live">管理员</span>
                  <span className="admin-status-pill admin-status-muted">资料中心</span>
                </div>
              </div>
            </div>
          </section>

          <section className="admin-surface-muted px-5 py-5">
            <div className="mb-5">
              <p className="admin-kicker">Profile</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#f1eadb]">基本信息</h2>
            </div>

            <form action={updateProfileAction} className="grid gap-4">
              <label className="grid gap-2">
                <span className="text-sm font-medium text-[#d5d0c2]">昵称</span>
                <input
                  type="text"
                  name="name"
                  defaultValue={profile.name ?? ""}
                  placeholder="输入显示给其他人的昵称"
                  className="admin-input"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-medium text-[#d5d0c2]">邮箱</span>
                <input
                  type="email"
                  name="email"
                  required
                  defaultValue={profile.email}
                  className="admin-input"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-medium text-[#d5d0c2]">头像链接</span>
                <input
                  type="url"
                  name="avatarUrl"
                  defaultValue={profile.avatarUrl ?? ""}
                  placeholder="https://example.com/avatar.jpg"
                  className="admin-input"
                />
              </label>

              <Button type="submit" className="mt-2 w-full justify-center sm:w-fit">
                保存资料
              </Button>
            </form>
          </section>

          <section className="admin-surface-muted px-5 py-5">
            <div className="mb-5">
              <p className="admin-kicker">Security</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#f1eadb]">修改密码</h2>
            </div>

            <form action={changePasswordAction} className="grid gap-4">
              <label className="grid gap-2">
                <span className="text-sm font-medium text-[#d5d0c2]">原密码</span>
                <input
                  type="password"
                  name="currentPassword"
                  required
                  className="admin-input"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-medium text-[#d5d0c2]">新密码</span>
                <input
                  type="password"
                  name="nextPassword"
                  required
                  minLength={8}
                  className="admin-input"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-medium text-[#d5d0c2]">确认新密码</span>
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  minLength={8}
                  className="admin-input"
                />
              </label>

              <Button type="submit" className="mt-2 w-full justify-center sm:w-fit">
                更新密码
              </Button>
            </form>
          </section>
        </div>

        <section className="admin-surface-muted px-5 py-5">
          <div className="flex flex-col gap-3 border-b border-white/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="admin-kicker">My Comments</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#f1eadb]">我的评论</h2>
            </div>
            <span className="admin-status-pill admin-status-muted">{comments.length} 条记录</span>
          </div>

          <div className="mt-5 grid gap-4">
            {comments.length > 0 ? (
              comments.map((comment) => (
                <article key={comment.id} className="admin-surface px-4 py-4">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <p className="font-semibold text-[#f1eadb]">
                          {comment.articleTitle ?? comment.articleSlug}
                        </p>
                        <span className={`admin-status-pill ${comment.status === "HIDDEN" ? "admin-status-draft" : "admin-status-live"}`}>
                          {comment.status === "HIDDEN" ? "已隐藏" : "已公开"}
                        </span>
                        {comment.replyToAuthorName ? (
                          <span className="border border-[#4a5244] px-2 py-1 text-[11px] uppercase tracking-[0.18em] text-[#8c9482]">
                            回复 {comment.replyToAuthorName}
                          </span>
                        ) : null}
                        {comment.repliesCount > 0 ? (
                          <span className="border border-[#4a5244] px-2 py-1 text-[11px] uppercase tracking-[0.18em] text-[#8c9482]">
                            {comment.repliesCount} 条回复
                          </span>
                        ) : null}
                        <span className="text-sm text-[#8c9482]">{formatAccountCommentDate(comment.createdAt)}</span>
                      </div>

                      <p className="mt-3 text-sm text-[#8c9482]">文章：{comment.articleSlug}</p>
                      <p className="mt-4 whitespace-pre-line text-sm leading-7 text-[#e7e0d0]">
                        {comment.content}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-3 xl:max-w-xs xl:justify-end">
                      <Button asChild variant="outline" size="sm" className="justify-center">
                        <Link href={`/articles/${comment.articleSlug}#article-engagement`}>查看文章</Link>
                      </Button>

                      <form action={deleteOwnCommentAction}>
                        <input type="hidden" name="commentId" value={comment.id} />
                        <Button
                          type="submit"
                          variant={comment.repliesCount > 0 ? "outline" : "destructive"}
                          size="sm"
                          className="justify-center"
                          disabled={comment.repliesCount > 0}
                        >
                          {comment.repliesCount > 0 ? "已有回复，暂不可删除" : "删除这条评论"}
                        </Button>
                      </form>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="admin-empty">
                你还没有发出过评论。
              </div>
            )}
          </div>
        </section>
      </div>
    </section>
  )
}
