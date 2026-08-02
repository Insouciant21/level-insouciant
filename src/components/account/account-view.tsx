import Link from "next/link"
import { ExternalLink, KeyRound, Save, Trash2 } from "lucide-react"

import {
  changePasswordAction,
  deleteOwnCommentAction,
  updateProfileAction,
} from "@/app/account/actions"
import { PageShell } from "@/components/blog/page-shell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { AccountCommentItem, AccountProfile } from "@/lib/account"
import { formatAccountCommentDate } from "@/lib/account-page"

type AccountViewProps = {
  profile: AccountProfile
  comments: AccountCommentItem[]
  notice: string | null
}

const accountPanelClass = "public-summary-panel-document px-6 py-6 sm:px-7"
const accountCardClass =
  "public-summary-card-muted bg-[#aaa891]/28 px-5 py-5 shadow-[inset_0_1px_0_rgba(255,252,225,0.14),0_14px_28px_-28px_rgba(0,0,0,0.26)]"
const accountEntryClass =
  "public-summary-card-muted px-4 py-4 transition duration-700 hover:border-foreground/20 hover:bg-[#d9d1ad]/46"
const accountChipClass =
  "h-auto public-summary-chip px-3 py-1 text-xs text-muted-foreground shadow-[inset_0_1px_0_rgba(255,252,225,0.16)]"

export function UserAccountView({
  profile,
  comments,
  notice,
}: AccountViewProps) {
  const initials = (profile.name || profile.email).slice(0, 1).toUpperCase()

  return (
    <PageShell>
      <Card className={`${accountPanelClass} py-6`}>
        <div className="flex flex-col gap-4 border-b border-border/60 pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="utility-kicker">Account Center</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              我的资料
            </h1>
          </div>
        </div>

        {notice ? (
          <p className="mt-5 text-sm text-muted-foreground">{notice}</p>
        ) : null}

        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
          <div className="grid gap-6">
            <Card size="sm" className={accountCardClass}>
              <div className="flex items-start gap-4">
                <div
                  className="flex size-16 shrink-0 items-center justify-center border border-[#73766f]/48 bg-[#d9d1ad]/52 text-lg font-semibold text-foreground shadow-[inset_0_1px_0_rgba(255,252,225,0.18)]"
                  style={
                    profile.avatarUrl
                      ? {
                          backgroundImage: `url(${profile.avatarUrl})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }
                      : undefined
                  }
                >
                  {!profile.avatarUrl ? initials : null}
                </div>

                <div>
                  <p className="text-lg font-semibold">
                    {profile.name || "未设置昵称"}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {profile.email}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    身份：普通用户
                  </p>
                </div>
              </div>
            </Card>

            <Card size="sm" className={accountCardClass}>
              <div className="mb-5">
                <p className="utility-kicker">Profile</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                  基本信息
                </h2>
              </div>

              <form action={updateProfileAction} className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="profile-name">昵称</Label>
                  <Input
                    id="profile-name"
                    type="text"
                    name="name"
                    defaultValue={profile.name ?? ""}
                    placeholder="输入显示给其他人的昵称"
                    className="field-input h-11 rounded-none"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="profile-email">邮箱</Label>
                  <Input
                    id="profile-email"
                    type="email"
                    name="email"
                    required
                    defaultValue={profile.email}
                    className="field-input h-11 rounded-none"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="profile-avatar">头像链接</Label>
                  <Input
                    id="profile-avatar"
                    type="url"
                    name="avatarUrl"
                    defaultValue={profile.avatarUrl ?? ""}
                    placeholder="https://example.com/avatar.jpg"
                    className="field-input h-11 rounded-none"
                  />
                </div>

                <Button
                  type="submit"
                  className="mt-2 w-full justify-center sm:w-fit"
                >
                  保存资料
                </Button>
              </form>
            </Card>

            <Card size="sm" className={accountCardClass}>
              <div className="mb-5">
                <p className="utility-kicker">Security</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                  修改密码
                </h2>
              </div>

              <form action={changePasswordAction} className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="current-password">原密码</Label>
                  <Input
                    id="current-password"
                    type="password"
                    name="currentPassword"
                    required
                    className="field-input h-11 rounded-none"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="next-password">新密码</Label>
                  <Input
                    id="next-password"
                    type="password"
                    name="nextPassword"
                    required
                    minLength={8}
                    className="field-input h-11 rounded-none"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="confirm-password">确认新密码</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    name="confirmPassword"
                    required
                    minLength={8}
                    className="field-input h-11 rounded-none"
                  />
                </div>

                <Button
                  type="submit"
                  className="mt-2 w-full justify-center sm:w-fit"
                >
                  更新密码
                </Button>
              </form>
            </Card>
          </div>

          <Card size="sm" className={accountCardClass}>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="utility-kicker">My Comments</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                  我的评论
                </h2>
              </div>
              <Badge variant="outline" className={accountChipClass}>
                {comments.length} 条
              </Badge>
            </div>

            <div className="mt-5 grid gap-4">
              {comments.length > 0 ? (
                comments.map((comment) => (
                  <article key={comment.id} className={accountEntryClass}>
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
                      <div className="flex flex-wrap items-center gap-3">
                        <Badge variant="outline" className={accountChipClass}>
                          {comment.status === "HIDDEN" ? "已隐藏" : "已公开"}
                        </Badge>
                        {comment.repliesCount > 0 ? (
                          <Badge variant="outline" className={accountChipClass}>
                            {comment.repliesCount} 条回复
                          </Badge>
                        ) : null}
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="justify-center"
                        >
                          <Link
                            href={`/articles/${comment.articleSlug}#article-engagement`}
                          >
                            查看文章
                          </Link>
                        </Button>
                      </div>
                    </div>

                    <p className="mt-4 text-sm leading-7 whitespace-pre-line text-muted-foreground">
                      {comment.content}
                    </p>

                    <form action={deleteOwnCommentAction} className="mt-4">
                      <input
                        type="hidden"
                        name="commentId"
                        value={comment.id}
                      />
                      <Button
                        type="submit"
                        variant={
                          comment.repliesCount > 0 ? "outline" : "destructive"
                        }
                        size="sm"
                        className="justify-center"
                        disabled={comment.repliesCount > 0}
                      >
                        {comment.repliesCount > 0
                          ? "已有回复，暂不可删除"
                          : "删除这条评论"}
                      </Button>
                    </form>
                  </article>
                ))
              ) : (
                <div className="rounded-3xl border border-dashed border-[#73766f]/48 bg-[#d9d1ad]/24 px-4 py-8 text-sm text-muted-foreground">
                  你还没有发出过评论。
                </div>
              )}
            </div>
          </Card>
        </div>
      </Card>
    </PageShell>
  )
}

export function AdminAccountView({
  profile,
  comments,
  notice,
}: AccountViewProps) {
  const initials = (profile.name || profile.email).slice(0, 1).toUpperCase()

  return (
    <section className="admin-surface p-4 sm:p-6">
      <div className="flex flex-col gap-4 border-b border-white/10 pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="admin-kicker-accent">Account Console</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#edf3e9] sm:text-4xl">
            我的资料
          </h1>
          <p className="admin-copy mt-2">
            管理管理员账号资料、密码，以及你在站内留下的评论记录。
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="admin-status-pill admin-status-live">
            <span className="size-1.5 rounded-full bg-[#b8d77c]" />
            管理员会话
          </span>
        </div>
      </div>

      {notice ? <p className="admin-copy mt-5">{notice}</p> : null}

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <div className="grid gap-6">
          <Card
            size="sm"
            className="admin-surface-muted px-4 py-4 sm:px-5 sm:py-5"
          >
            <div className="flex items-start gap-4">
              <div
                className="flex size-16 shrink-0 items-center justify-center rounded-lg border border-[#b8d77c]/25 bg-[#b8d77c]/10 text-lg font-semibold text-[#d0ec93]"
                style={
                  profile.avatarUrl
                    ? {
                        backgroundImage: `url(${profile.avatarUrl})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }
                    : undefined
                }
              >
                {!profile.avatarUrl ? initials : null}
              </div>

              <div className="min-w-0">
                <p className="text-lg font-semibold text-[#edf3e9]">
                  {profile.name || "未设置昵称"}
                </p>
                <p className="mt-1 text-sm break-all text-[#9aa79a]">
                  {profile.email}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="admin-status-pill admin-status-live">
                    管理员
                  </span>
                  <span className="admin-status-pill admin-status-muted">
                    资料中心
                  </span>
                </div>
              </div>
            </div>
          </Card>

          <Card
            size="sm"
            className="admin-surface-muted px-4 py-4 sm:px-5 sm:py-5"
          >
            <div className="mb-5">
              <p className="admin-kicker">Profile</p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight text-[#edf3e9] sm:text-2xl">
                基本信息
              </h2>
            </div>

            <form action={updateProfileAction} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="admin-profile-name" className="text-[#dce6d8]">
                  昵称
                </Label>
                <Input
                  id="admin-profile-name"
                  type="text"
                  name="name"
                  defaultValue={profile.name ?? ""}
                  placeholder="输入显示给其他人的昵称"
                  className="admin-input"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="admin-profile-email" className="text-[#dce6d8]">
                  邮箱
                </Label>
                <Input
                  id="admin-profile-email"
                  type="email"
                  name="email"
                  required
                  defaultValue={profile.email}
                  className="admin-input"
                />
              </div>

              <div className="grid gap-2">
                <Label
                  htmlFor="admin-profile-avatar"
                  className="text-[#dce6d8]"
                >
                  头像链接
                </Label>
                <Input
                  id="admin-profile-avatar"
                  type="url"
                  name="avatarUrl"
                  defaultValue={profile.avatarUrl ?? ""}
                  placeholder="https://example.com/avatar.jpg"
                  className="admin-input"
                />
              </div>

              <Button
                type="submit"
                className="mt-2 w-full justify-center sm:w-fit"
              >
                <Save className="size-4" aria-hidden="true" />
                保存资料
              </Button>
            </form>
          </Card>

          <Card
            size="sm"
            className="admin-surface-muted px-4 py-4 sm:px-5 sm:py-5"
          >
            <div className="mb-5">
              <p className="admin-kicker">Security</p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight text-[#edf3e9] sm:text-2xl">
                修改密码
              </h2>
            </div>

            <form action={changePasswordAction} className="grid gap-4">
              <div className="grid gap-2">
                <Label
                  htmlFor="admin-current-password"
                  className="text-[#dce6d8]"
                >
                  原密码
                </Label>
                <Input
                  id="admin-current-password"
                  type="password"
                  name="currentPassword"
                  required
                  className="admin-input"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="admin-next-password" className="text-[#dce6d8]">
                  新密码
                </Label>
                <Input
                  id="admin-next-password"
                  type="password"
                  name="nextPassword"
                  required
                  minLength={8}
                  className="admin-input"
                />
              </div>

              <div className="grid gap-2">
                <Label
                  htmlFor="admin-confirm-password"
                  className="text-[#dce6d8]"
                >
                  确认新密码
                </Label>
                <Input
                  id="admin-confirm-password"
                  type="password"
                  name="confirmPassword"
                  required
                  minLength={8}
                  className="admin-input"
                />
              </div>

              <Button
                type="submit"
                className="mt-2 w-full justify-center sm:w-fit"
              >
                <KeyRound className="size-4" aria-hidden="true" />
                更新密码
              </Button>
            </form>
          </Card>
        </div>

        <Card
          size="sm"
          className="admin-surface-muted px-4 py-4 sm:px-5 sm:py-5"
        >
          <div className="flex flex-col gap-3 border-b border-white/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="admin-kicker">My Comments</p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight text-[#edf3e9] sm:text-2xl">
                我的评论
              </h2>
            </div>
            <span className="admin-status-pill admin-status-muted">
              {comments.length} 条记录
            </span>
          </div>

          <div className="mt-5 grid gap-4">
            {comments.length > 0 ? (
              comments.map((comment) => (
                <article key={comment.id} className="admin-surface p-4">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <p className="font-semibold text-[#edf3e9]">
                          {comment.articleTitle ?? comment.articleSlug}
                        </p>
                        <span
                          className={`admin-status-pill ${comment.status === "HIDDEN" ? "admin-status-draft" : "admin-status-live"}`}
                        >
                          {comment.status === "HIDDEN" ? "已隐藏" : "已公开"}
                        </span>
                        {comment.replyToAuthorName ? (
                          <span className="admin-status-pill admin-status-muted">
                            回复 {comment.replyToAuthorName}
                          </span>
                        ) : null}
                        {comment.repliesCount > 0 ? (
                          <span className="admin-status-pill admin-status-muted">
                            {comment.repliesCount} 条回复
                          </span>
                        ) : null}
                        <span className="text-xs text-[#748073]">
                          {formatAccountCommentDate(comment.createdAt)}
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
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="justify-center"
                      >
                        <Link
                          href={`/articles/${comment.articleSlug}#article-engagement`}
                        >
                          <ExternalLink
                            className="size-3.5"
                            aria-hidden="true"
                          />
                          查看文章
                        </Link>
                      </Button>

                      <form action={deleteOwnCommentAction}>
                        <input
                          type="hidden"
                          name="commentId"
                          value={comment.id}
                        />
                        <Button
                          type="submit"
                          variant={
                            comment.repliesCount > 0 ? "outline" : "destructive"
                          }
                          size="sm"
                          className="justify-center"
                          disabled={comment.repliesCount > 0}
                        >
                          <Trash2 className="size-3.5" aria-hidden="true" />
                          {comment.repliesCount > 0
                            ? "已有回复，暂不可删除"
                            : "删除这条评论"}
                        </Button>
                      </form>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="admin-empty">你还没有发出过评论。</div>
            )}
          </div>
        </Card>
      </div>
    </section>
  )
}
