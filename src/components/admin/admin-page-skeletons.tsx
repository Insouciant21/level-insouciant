import type { ReactNode } from "react"

import { ArrowRight, ShieldCheck } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

type AdminSkeletonTone = "soft" | "accent" | "inverse"
type AdminActionTone = AdminSkeletonTone | "danger"

type AdminSkeletonProps = {
  className?: string
  tone?: AdminSkeletonTone
}

type AdminStaticActionProps = {
  children: ReactNode
  className?: string
  variant?: "default" | "outline" | "destructive" | "secondary"
  size?: "default" | "sm" | "lg"
}

function AdminSkeleton({ className, tone = "inverse" }: AdminSkeletonProps) {
  return <Skeleton tone={tone} className={cn("shadow-none", className)} />
}

function AdminAccentSkeleton({ className }: { className?: string }) {
  return <AdminSkeleton tone="accent" className={className} />
}

function AdminDangerSkeleton({ className }: { className?: string }) {
  return (
    <AdminSkeleton
      tone="soft"
      className={cn(
        "border-[#f08b81]/30 bg-[#f08b81]/12 shadow-none",
        className
      )}
    />
  )
}

function AdminActionSkeleton({
  className,
  tone = "soft",
}: {
  className?: string
  tone?: AdminActionTone
}) {
  if (tone === "danger") {
    return <AdminDangerSkeleton className={className} />
  }

  return <AdminSkeleton tone={tone} className={className} />
}

function AdminStaticAction({
  children,
  className,
  variant = "default",
  size = "sm",
}: AdminStaticActionProps) {
  return (
    <span
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={buttonVariants({ variant, size, className })}
    >
      {children}
    </span>
  )
}

function AdminStaticStatus({ children }: { children: ReactNode }) {
  return (
    <span className="admin-status-pill admin-status-live">
      <span className="size-1.5 rounded-full bg-[var(--safety-exit-green)]" />
      {children}
    </span>
  )
}

function AdminMetricCardSkeleton({
  label,
  hint,
}: {
  label?: string
  hint?: string
}) {
  return (
    <article
      data-skeleton-metric-card
      className="admin-surface min-w-0 px-5 py-5"
    >
      <div className="flex items-center justify-between gap-3">
        {label ? (
          <p className="admin-kicker">{label}</p>
        ) : (
          <AdminSkeleton tone="soft" className="h-4 w-24 max-w-full" />
        )}
        <div data-skeleton-metric-icon className="size-8 shrink-0 rounded-md">
          <AdminAccentSkeleton className="size-full rounded-md" />
        </div>
      </div>
      <div data-skeleton-metric-value className="mt-4 h-9 w-16">
        <AdminSkeleton className="size-full" />
      </div>
      {hint ? (
        <p
          data-skeleton-metric-hint
          className="mt-2 text-xs leading-5 text-[#748073]"
        >
          {hint}
        </p>
      ) : (
        <div data-skeleton-metric-hint className="mt-2 h-5 w-full">
          <AdminSkeleton tone="soft" className="size-full" />
        </div>
      )}
    </article>
  )
}

function AdminListCardSkeleton({
  muted = false,
  showTags = false,
  showActionRow = true,
  actionCount = 2,
  metaCount = 3,
  showDetails = false,
  actionTones = ["soft", "accent"],
  actionLabels,
  sideActionLabels,
}: {
  muted?: boolean
  showTags?: boolean
  showActionRow?: boolean
  actionCount?: number
  metaCount?: number
  showDetails?: boolean
  actionTones?: AdminActionTone[]
  actionLabels?: Array<string | null>
  sideActionLabels?: Array<string | null>
}) {
  return (
    <article
      className={cn(
        "min-w-0 px-4 py-4 sm:px-5 sm:py-5",
        muted ? "admin-surface-muted" : "admin-surface"
      )}
    >
      <div className="flex min-w-0 flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 flex-wrap items-center gap-3">
            <AdminSkeleton className="h-6 w-48 max-w-full" />
            <AdminAccentSkeleton className="h-7 w-20" />
            <AdminSkeleton tone="soft" className="h-4 w-28 max-w-full" />
          </div>

          <AdminSkeleton tone="soft" className="mt-3 h-4 w-full" />
          <AdminSkeleton tone="soft" className="mt-2 h-4 w-5/6 max-w-full" />

          <div className="mt-4 flex min-w-0 flex-wrap gap-x-5 gap-y-2">
            {Array.from({ length: metaCount }).map((_, index) => (
              <AdminSkeleton
                key={index}
                tone="soft"
                className="h-4 w-20 max-w-full"
              />
            ))}
          </div>

          {showTags ? (
            <div className="mt-4 flex min-w-0 flex-wrap gap-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <AdminSkeleton key={index} tone="soft" className="h-7 w-16" />
              ))}
            </div>
          ) : null}

          {showActionRow ? (
            <div className="mt-4 flex min-w-0 flex-wrap gap-x-4 gap-y-2">
              {actionLabels
                ? actionLabels.map((label, index) =>
                    label ? (
                      <span
                        key={`${label}-${index}`}
                        className="admin-link inline-flex items-center text-sm"
                      >
                        {label}
                      </span>
                    ) : (
                      <AdminActionSkeleton
                        key={`action-skeleton-${index}`}
                        tone="soft"
                        className="h-4 w-20"
                      />
                    )
                  )
                : Array.from({ length: 3 }).map((_, index) => (
                    <AdminActionSkeleton
                      key={index}
                      tone="soft"
                      className="h-4 w-20"
                    />
                  ))}
            </div>
          ) : null}

          {showDetails ? (
            <div className="mt-4 grid gap-2 border-t border-white/10 pt-4">
              <AdminSkeleton tone="soft" className="h-4 w-28" />
              <AdminSkeleton tone="soft" className="h-4 w-full" />
              <AdminSkeleton tone="soft" className="h-4 w-full" />
              <AdminSkeleton tone="soft" className="h-4 w-5/6 max-w-full" />
            </div>
          ) : null}
        </div>

        {actionCount > 0 ? (
          <div className="flex min-w-0 shrink-0 flex-wrap gap-2 xl:max-w-xs xl:justify-end">
            {sideActionLabels
              ? sideActionLabels.map((label, index) =>
                  label ? (
                    <AdminStaticAction
                      key={`${label}-${index}`}
                      variant="outline"
                    >
                      {label}
                    </AdminStaticAction>
                  ) : (
                    <AdminActionSkeleton
                      key={`side-action-skeleton-${index}`}
                      tone={actionTones[index] ?? "soft"}
                      className="h-9 w-24"
                    />
                  )
                )
              : Array.from({ length: actionCount }).map((_, index) => (
                  <AdminActionSkeleton
                    key={index}
                    tone={actionTones[index] ?? "soft"}
                    className="h-9 w-24"
                  />
                ))}
          </div>
        ) : null}
      </div>
    </article>
  )
}

function AdminPageHeaderSkeleton({
  variant = "standard",
  titleWidth = "w-56",
  kicker = "accent",
  action = false,
  status = false,
  kickerText,
  titleText,
  actionText,
  statusText,
}: {
  variant?: "standard" | "dashboard" | "account"
  titleWidth?: string
  kicker?: "accent" | "default"
  action?: boolean
  status?: boolean
  kickerText?: string
  titleText?: string
  actionText?: string
  statusText?: string
}) {
  const kickerClass =
    kicker === "accent" ? "admin-kicker-accent" : "admin-kicker"
  const titleClass =
    variant === "standard"
      ? "admin-title max-w-full"
      : "max-w-full text-3xl font-semibold tracking-tight text-[#edf3e9] sm:text-4xl"
  const kickerNode = kickerText ? (
    <p data-admin-skeleton-kicker="top-level" className={kickerClass}>
      {kickerText}
    </p>
  ) : (
    <div data-admin-skeleton-kicker="top-level">
      {kicker === "accent" ? (
        <AdminAccentSkeleton className="h-4 w-32 max-w-full" />
      ) : (
        <AdminSkeleton tone="soft" className="h-4 w-28 max-w-full" />
      )}
    </div>
  )
  const titleNode = titleText ? (
    <h1 className={titleClass}>{titleText}</h1>
  ) : (
    <AdminSkeleton
      className={cn(
        variant === "standard" ? "h-8" : "h-10",
        "max-w-full",
        titleWidth
      )}
    />
  )
  const actionNode = actionText ? (
    <AdminStaticAction size="default" className="w-full sm:w-auto">
      {actionText}
    </AdminStaticAction>
  ) : action ? (
    <AdminAccentSkeleton className="h-10 w-28" />
  ) : null
  const statusNode = statusText ? (
    <AdminStaticStatus>{statusText}</AdminStaticStatus>
  ) : status ? (
    <AdminAccentSkeleton className="h-7 w-24" />
  ) : null

  if (variant === "dashboard") {
    return (
      <header
        data-admin-skeleton-header="dashboard"
        className="flex min-w-0 flex-col border-b border-white/10 pb-6"
      >
        {kickerNode}
        <div className="mt-3 flex min-w-0 flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            {titleNode}
          </div>
          {statusNode}
        </div>
      </header>
    )
  }

  if (variant === "account") {
    return (
      <header
        data-admin-skeleton-header="account"
        className="flex min-w-0 flex-col gap-4 border-b border-white/10 pb-5 lg:flex-row lg:items-end lg:justify-between"
      >
        <div className="min-w-0">
          {kickerNode}
          <div className="mt-3">
            {titleNode}
          </div>
        </div>
        {statusNode ? (
          <div className="flex flex-wrap items-center gap-3">{statusNode}</div>
        ) : null}
      </header>
    )
  }

  const hasAside = Boolean(actionNode || statusNode)

  return (
    <header
      data-admin-skeleton-header="standard"
      className={cn(
        "flex min-w-0 flex-col",
        hasAside ? "gap-4 lg:flex-row lg:items-end lg:justify-between" : "gap-2"
      )}
    >
      <div
        data-admin-skeleton-header-content
        className="flex min-w-0 flex-col gap-2"
      >
        {kickerNode}
        {titleNode}
      </div>
      {actionNode}
      {statusNode}
    </header>
  )
}

function AdminEditorFieldSkeleton({
  labelWidth = "w-16",
  multiline = false,
  className,
  contentClassName,
  label,
}: {
  labelWidth?: string
  multiline?: boolean
  className?: string
  contentClassName?: string
  label?: string
}) {
  return (
    <div
      data-skeleton-editor-field
      className={cn("grid min-w-0 gap-2", className)}
    >
      {label ? (
        <label className="text-sm font-medium text-[#dce6d8]">{label}</label>
      ) : (
        <AdminSkeleton tone="soft" className={cn("h-4", labelWidth)} />
      )}
      <AdminSkeleton
        className={cn(
          "min-w-0",
          multiline ? "h-24 min-h-24" : "h-10",
          contentClassName
        )}
      />
    </div>
  )
}

function AdminLoginPageSkeleton() {
  return (
    <main
      data-skeleton-layout="admin-login"
      className="admin-console flex min-h-svh flex-1 items-center justify-center px-4 py-10 sm:px-6 lg:px-8"
    >
      <section className="admin-auth-panel grid w-full max-w-4xl overflow-hidden lg:grid-cols-[minmax(0,1.05fr)_minmax(20rem,0.95fr)]">
        <div className="flex min-w-0 flex-col justify-between gap-10 border-b border-white/10 px-6 py-8 sm:px-8 sm:py-10 lg:border-r lg:border-b-0 lg:px-10">
          <div className="space-y-6">
            <div className="flex size-11 items-center justify-center rounded-lg border border-[var(--safety-exit-green)]/35 bg-[var(--safety-exit-green)]/10 text-[var(--safety-exit-green)]">
              <ShieldCheck className="size-5" aria-hidden="true" />
            </div>
            <div className="space-y-3">
              <p
                data-admin-skeleton-kicker="top-level"
                className="admin-kicker-accent"
              >
                Admin Access
              </p>
              <h1 className="text-3xl font-semibold tracking-tight text-[#edf3e9] sm:text-4xl">
                登录后台控制台
              </h1>
            </div>
          </div>

          <div className="space-y-4">
            <AdminSkeleton tone="soft" className="h-px w-full" />
            <div className="flex flex-wrap items-center justify-between gap-4">
              <span className="text-xs text-[#748073]">Level Insouciant</span>
              <span className="text-xs tracking-[0.12em] text-[#748073] uppercase">
                Private workspace
              </span>
            </div>
          </div>
        </div>

        <div className="grid min-w-0 gap-5 px-6 py-8 sm:px-8 sm:py-10">
          <div>
            <p className="text-base font-semibold text-[#edf3e9]">管理员登录</p>
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-[#dce6d8]">邮箱</label>
            <AdminSkeleton className="h-10 w-full" />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-[#dce6d8]">密码</label>
            <AdminSkeleton className="h-10 w-full" />
          </div>
          <AdminStaticAction size="default" className="w-full justify-center">
            进入控制台
            <ArrowRight className="size-4" />
          </AdminStaticAction>
        </div>
      </section>
    </main>
  )
}

function AdminDashboardPanelSkeleton({
  muted = false,
  kickerText,
  titleText,
  linkText,
}: {
  muted?: boolean
  kickerText?: string
  titleText?: string
  linkText?: string
}) {
  return (
    <article
      className={cn(
        "min-w-0 px-5 py-5 sm:px-6 sm:py-6",
        muted ? "admin-surface-muted" : "admin-surface"
      )}
    >
      <div className="flex min-w-0 items-center justify-between gap-4">
        <div className="min-w-0">
          {kickerText ? (
            <p className="admin-kicker">{kickerText}</p>
          ) : (
            <AdminAccentSkeleton className="h-4 w-24 max-w-full" />
          )}
          {titleText ? (
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-[#edf3e9] sm:text-2xl">
              {titleText}
            </h2>
          ) : (
            <AdminSkeleton className="mt-2 h-8 w-32 max-w-full" />
          )}
        </div>
        {linkText ? (
          <span className="admin-link shrink-0">{linkText}</span>
        ) : (
          <AdminSkeleton tone="soft" className="h-4 w-24 max-w-full" />
        )}
      </div>

      <div className="mt-5 grid gap-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="flex min-w-0 items-start justify-between gap-4 border-b border-white/10 py-4 first:pt-0 last:border-b-0 last:pb-0"
          >
            <div className="min-w-0 flex-1">
              <AdminSkeleton className="h-5 w-3/4 max-w-full" />
              <AdminSkeleton tone="soft" className="mt-2 h-4 w-full" />
              <AdminSkeleton tone="soft" className="mt-3 h-3 w-24" />
            </div>
            <AdminAccentSkeleton className="h-7 w-20" />
          </div>
        ))}
      </div>
    </article>
  )
}

function AdminDashboardPageSkeleton() {
  return (
    <div data-skeleton-layout="admin-dashboard" className="grid min-w-0 gap-8">
      <AdminPageHeaderSkeleton
        variant="dashboard"
        titleText="后台概览"
        kickerText="Operations Console"
        statusText="系统正常"
      />

      <section className="grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AdminMetricCardSkeleton label="已发布文章" hint="面向前台公开展示" />
        <AdminMetricCardSkeleton label="草稿文章" hint="仍在编辑或隐藏中" />
        <AdminMetricCardSkeleton label="全部阅读量" hint="累计 page views" />
        <AdminMetricCardSkeleton label="全部评论数" hint="隐藏评论仍计入总量" />
      </section>

      <section className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <AdminDashboardPanelSkeleton
          kickerText="Draft Queue"
          titleText="草稿队列"
          linkText="查看全部"
        />
        <AdminDashboardPanelSkeleton
          muted
          kickerText="Top Content"
          titleText="热门文章"
          linkText="查看统计详情"
        />
      </section>

      <section className="grid min-w-0 gap-4 md:grid-cols-3">
        <AdminMetricCardSkeleton
          label="标签主题"
          hint="草稿与公开文章一并统计"
        />
        <AdminMetricCardSkeleton label="累计点赞" hint="按文章聚合" />
        <AdminMetricCardSkeleton label="账号数" hint="当前数据库中的已建账号" />
      </section>
    </div>
  )
}

function AdminProtectedPageSkeleton() {
  return (
    <div className="grid min-w-0 gap-6">
      <AdminPageHeaderSkeleton
        kickerText="Admin Workspace"
        titleText="后台工作区"
      />

      <section className="grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <AdminMetricCardSkeleton label="公开记录" hint="内容数据" />
        <AdminMetricCardSkeleton label="互动数据" hint="评论与点赞" />
        <AdminMetricCardSkeleton label="用户规模" hint="当前账号" />
      </section>

      <section className="grid min-w-0 gap-4">
        {Array.from({ length: 2 }).map((_, index) => (
          <AdminListCardSkeleton key={index} muted showTags={index === 0} />
        ))}
      </section>
    </div>
  )
}

function AdminArticlesPageSkeleton() {
  return (
    <section
      data-skeleton-layout="admin-articles"
      className="admin-surface min-w-0 p-4 sm:p-6"
    >
      <AdminPageHeaderSkeleton
        kickerText="Article Control"
        titleText="草稿与文章管理"
        actionText="新建文章"
      />

      <div className="mt-6 grid min-w-0 gap-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <AdminListCardSkeleton
            key={index}
            muted
            showTags
            actionLabels={["编辑文章", "修订历史", null]}
            actionTones={["accent", "danger"]}
          />
        ))}
      </div>
    </section>
  )
}

function AdminCommentsPageSkeleton() {
  return (
    <section className="admin-surface min-w-0 p-4 sm:p-6">
      <AdminPageHeaderSkeleton
        kickerText="Comment Moderation"
        titleText="评论管理"
      />

      <div className="mt-6 grid min-w-0 gap-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <AdminListCardSkeleton
            key={index}
            muted
            metaCount={2}
            showActionRow={false}
            actionTones={["accent", "danger"]}
          />
        ))}
      </div>
    </section>
  )
}

function AdminTagsPageSkeleton() {
  return (
    <section className="admin-surface min-w-0 p-4 sm:p-6">
      <AdminPageHeaderSkeleton
        kickerText="Tag Operations"
        titleText="标签管理"
      />

      <div className="mt-6 grid min-w-0 gap-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <article
            key={index}
            className="admin-surface-muted min-w-0 px-4 py-4 sm:px-5 sm:py-5"
          >
            <div className="flex min-w-0 flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex min-w-0 flex-wrap items-center gap-3">
                  <AdminSkeleton className="h-6 w-24 max-w-full" />
                  <AdminSkeleton tone="soft" className="h-7 w-20" />
                </div>
                <AdminSkeleton tone="soft" className="mt-3 h-4 w-full" />
                <AdminSkeleton
                  tone="soft"
                  className="mt-2 h-4 w-5/6 max-w-full"
                />
              </div>

              <div className="grid min-w-0 gap-3 xl:min-w-[24rem]">
                <div className="flex min-w-0 flex-col gap-3 sm:flex-row">
                  <AdminSkeleton className="h-10 min-w-0 flex-1" />
                  <AdminStaticAction
                    variant="outline"
                    className="w-full sm:w-24"
                  >
                    重命名
                  </AdminStaticAction>
                </div>
                <AdminStaticAction variant="destructive" className="w-40">
                  从所有文章中移除
                </AdminStaticAction>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

function AdminStatsPageSkeleton() {
  return (
    <section
      data-skeleton-layout="admin-stats"
      className="admin-surface min-w-0 p-4 sm:p-6"
    >
      <AdminPageHeaderSkeleton
        kickerText="Article Analytics"
        titleText="文章统计"
      />

      <div className="mt-6 min-w-0 overflow-x-auto rounded-lg border border-white/10">
        <table className="w-full min-w-[760px] table-fixed border-collapse">
          <colgroup>
            <col className="w-[15rem]" />
            <col className="w-[7rem]" />
            <col className="w-[8rem]" />
            <col className="w-[7rem]" />
            <col className="w-[7rem]" />
            <col className="w-[7rem]" />
            <col className="w-[7rem]" />
          </colgroup>
          <thead className="bg-white/[0.04]">
            <tr className="h-10 text-left">
              {[
                "文章",
                "状态",
                "发布时间",
                "阅读",
                "点赞",
                "公开评论",
                "隐藏评论",
              ].map((label) => (
                <th
                  key={label}
                  className="px-4 py-3 text-xs font-medium text-[#9aa79a]"
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {Array.from({ length: 5 }).map((_, index) => (
              <tr key={index} className="h-[76px]">
                <td className="px-4 py-4 align-top">
                  <AdminSkeleton className="h-5 w-36 max-w-full" />
                  <AdminSkeleton tone="soft" className="mt-2 h-4 w-24" />
                </td>
                {Array.from({ length: 5 }).map((_, cellIndex) => (
                  <td key={cellIndex} className="px-4 py-4 align-top">
                    <AdminSkeleton tone="soft" className="h-4 w-16" />
                  </td>
                ))}
                <td className="px-4 py-4 align-top">
                  <AdminSkeleton tone="soft" className="h-4 w-16" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function AdminAccountPageSkeleton() {
  return (
    <section className="admin-surface min-w-0 p-4 sm:p-6">
      <AdminPageHeaderSkeleton
        variant="account"
        kickerText="Account Console"
        titleText="我的资料"
        statusText="管理员会话"
      />

      <div className="mt-6 grid min-w-0 gap-6 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <div className="grid min-w-0 gap-6">
          <section className="admin-surface-muted min-w-0 px-4 py-4 sm:px-5 sm:py-5">
            <div className="flex min-w-0 items-start gap-4">
              <AdminSkeleton className="size-16 shrink-0 rounded-lg" />
              <div className="min-w-0 flex-1">
                <AdminSkeleton className="h-7 w-28 max-w-full" />
                <AdminSkeleton
                  tone="soft"
                  className="mt-1 h-5 w-44 max-w-full"
                />
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
          </section>

          <AdminAccountFormSkeleton
            fieldLabels={["昵称", "邮箱", "头像链接"]}
            kickerText="Profile"
            titleText="基本信息"
            submitText="保存资料"
          />
          <AdminAccountFormSkeleton
            fieldLabels={["原密码", "新密码", "确认新密码"]}
            labelWidth="w-20"
            kickerText="Security"
            titleText="修改密码"
            submitText="更新密码"
          />
        </div>

        <section className="admin-surface-muted min-w-0 px-4 py-4 sm:px-5 sm:py-5">
          <div className="flex min-w-0 flex-col gap-3 border-b border-white/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="admin-kicker">My Comments</p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight text-[#edf3e9] sm:text-2xl">
                我的评论
              </h2>
            </div>
            <AdminSkeleton tone="soft" className="h-7 w-20" />
          </div>

          <div className="mt-5 grid min-w-0 gap-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <AdminListCardSkeleton
                key={index}
                actionCount={2}
                metaCount={1}
                showActionRow={false}
              />
            ))}
          </div>
        </section>
      </div>
    </section>
  )
}

function AdminAccountFormSkeleton({
  labelWidth = "w-16",
  fieldLabels,
  kickerText,
  titleText,
  submitText,
}: {
  labelWidth?: string
  fieldLabels?: string[]
  kickerText?: string
  titleText?: string
  submitText?: string
}) {
  return (
    <section className="admin-surface-muted min-w-0 px-4 py-4 sm:px-5 sm:py-5">
      <div className="mb-5">
        {kickerText ? (
          <p className="admin-kicker">{kickerText}</p>
        ) : (
          <AdminSkeleton tone="soft" className="h-4 w-20" />
        )}
        {titleText ? (
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-[#edf3e9] sm:text-2xl">
            {titleText}
          </h2>
        ) : (
          <AdminSkeleton className="mt-2 h-8 w-32 max-w-full" />
        )}
      </div>
      <div className="grid min-w-0 gap-4">
        {(fieldLabels ?? Array.from({ length: 3 })).map((label, index) => (
          <AdminEditorFieldSkeleton
            key={index}
            labelWidth={labelWidth}
            label={typeof label === "string" ? label : undefined}
          />
        ))}
        {submitText ? (
          <AdminStaticAction className="mt-2 w-full sm:w-28">
            {submitText}
          </AdminStaticAction>
        ) : (
          <AdminAccentSkeleton className="mt-2 h-10 w-full sm:w-28" />
        )}
      </div>
    </section>
  )
}

function AdminSettingsLinkEditorSkeleton({
  title,
  itemCount = 2,
}: {
  title: string
  itemCount?: number
}) {
  return (
    <section className="grid gap-4 border-t border-white/10 pt-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-[#edf3e9]">{title}</h2>
        <AdminStaticAction variant="outline" size="sm">
          添加{title}
        </AdminStaticAction>
      </div>

      <div className="grid gap-4">
        {Array.from({ length: itemCount }).map((_, index) => (
          <div
            key={index}
            className="grid gap-4 border border-white/10 bg-[#171b16] p-4 lg:grid-cols-[minmax(0,1fr)_auto]"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <AdminEditorFieldSkeleton label="类型" labelWidth="w-10" />
              <AdminEditorFieldSkeleton label="标签" labelWidth="w-10" />
              <AdminEditorFieldSkeleton label="显示内容" labelWidth="w-16" />
              <AdminEditorFieldSkeleton label="链接地址" labelWidth="w-16" />
            </div>
            <div className="flex items-start justify-end gap-2 lg:flex-col">
              {Array.from({ length: 5 }).map((__, actionIndex) => (
                <AdminSkeleton
                  key={actionIndex}
                  tone="soft"
                  className="size-7 shrink-0 rounded-md"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function AdminSettingsPageSkeleton() {
  return (
    <div data-skeleton-layout="admin-settings" className="grid min-w-0 gap-6">
      <header className="admin-surface min-w-0 p-4 sm:p-6 lg:p-7">
        <p
          data-admin-skeleton-kicker="top-level"
          className="admin-kicker-accent"
        >
          Site Settings
        </p>
        <h1 className="admin-title mt-2">站点设置</h1>
      </header>

      <div className="site-settings-form admin-surface grid min-w-0 gap-7 p-4 sm:p-6 lg:p-7">
        <section className="grid gap-4">
          <h2 className="text-lg font-semibold text-[#edf3e9]">站点与 SEO</h2>
          <div className="grid gap-5 lg:grid-cols-2">
            <AdminEditorFieldSkeleton label="站点名称" labelWidth="w-20" />
            <AdminEditorFieldSkeleton label="作者名称" labelWidth="w-20" />
            <AdminEditorFieldSkeleton label="联系邮箱" labelWidth="w-20" />
            <AdminEditorFieldSkeleton label="站点地址" labelWidth="w-20" />
            <AdminEditorFieldSkeleton
              label="站点描述"
              labelWidth="w-20"
              multiline
            />
            <AdminEditorFieldSkeleton
              label="默认 OG 图片替代文本"
              labelWidth="w-36"
            />
            <AdminEditorFieldSkeleton
              label="SEO 关键词（逗号分隔）"
              labelWidth="w-40"
              multiline
            />
          </div>
        </section>

        <section className="grid gap-4 border-t border-white/10 pt-5">
          <h2 className="text-lg font-semibold text-[#edf3e9]">首页 Hero</h2>
          <div className="grid gap-5 lg:grid-cols-2">
            <AdminEditorFieldSkeleton label="眉题" labelWidth="w-10" />
            <AdminEditorFieldSkeleton label="标题" labelWidth="w-10" />
          </div>
        </section>

        <section className="grid gap-4 border-t border-white/10 pt-5">
          <h2 className="text-lg font-semibold text-[#edf3e9]">个人资料</h2>
          <div className="grid gap-5 lg:grid-cols-2">
            <AdminEditorFieldSkeleton label="资料标题" labelWidth="w-20" />
            <AdminEditorFieldSkeleton label="状态" labelWidth="w-10" />
            <AdminEditorFieldSkeleton label="位置" labelWidth="w-10" />
            <AdminEditorFieldSkeleton
              label="摘要"
              labelWidth="w-10"
              multiline
            />
          </div>
        </section>

        <section className="grid gap-4 border-t border-white/10 pt-5">
          <h2 className="text-lg font-semibold text-[#edf3e9]">About</h2>
          <div className="grid gap-5 lg:grid-cols-2">
            <AdminEditorFieldSkeleton
              label="须知页面元标题"
              labelWidth="w-28"
            />
            <AdminEditorFieldSkeleton label="须知页标题" labelWidth="w-24" />
            <AdminEditorFieldSkeleton
              label="须知页描述"
              labelWidth="w-24"
              multiline
            />
            <AdminEditorFieldSkeleton label="档案节点标签" labelWidth="w-24" />
            <AdminEditorFieldSkeleton label="状态标签" labelWidth="w-20" />
            <AdminEditorFieldSkeleton label="状态值" labelWidth="w-16" />
            <AdminEditorFieldSkeleton label="联系标题" labelWidth="w-20" />
            <AdminEditorFieldSkeleton
              label="引言"
              labelWidth="w-10"
              multiline
            />
            <AdminEditorFieldSkeleton
              label="介绍"
              labelWidth="w-10"
              multiline
            />
            <AdminEditorFieldSkeleton
              label="原则"
              labelWidth="w-10"
              multiline
            />
            <div className="grid gap-5">
              <AdminEditorFieldSkeleton
                label="档案入口文字"
                labelWidth="w-28"
              />
              <AdminEditorFieldSkeleton
                label="档案入口地址"
                labelWidth="w-28"
              />
            </div>
            <div className="grid gap-5">
              <AdminEditorFieldSkeleton
                label="传输入口文字"
                labelWidth="w-28"
              />
              <AdminEditorFieldSkeleton
                label="传输入口地址"
                labelWidth="w-28"
              />
            </div>
          </div>
        </section>

        <AdminSettingsLinkEditorSkeleton title="联系方式" itemCount={3} />

        <AdminSettingsLinkEditorSkeleton title="页脚链接" itemCount={3} />

        <div className="flex justify-end border-t border-white/10 pt-5">
          <AdminStaticAction>保存站点设置</AdminStaticAction>
        </div>
      </div>
    </div>
  )
}

function AdminArticleEditorPageSkeleton({
  mode = "edit",
}: {
  mode?: "create" | "edit"
} = {}) {
  return (
    <section
      data-skeleton-layout="admin-editor"
      className="admin-surface min-w-0 p-4 sm:p-6 lg:p-7"
    >
      <div className="flex min-w-0 flex-col gap-3 border-b border-white/10 pb-5">
        <div className="flex min-w-0 flex-wrap items-center gap-3">
          <p
            data-admin-skeleton-kicker="top-level"
            className="admin-kicker-accent"
          >
            {mode === "create" ? "New Article" : "Edit Article"}
          </p>
          <AdminSkeleton tone="soft" className="h-7 w-24" />
        </div>
        <div className="flex min-w-0 flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <h1 className="admin-title">
              {mode === "create" ? "新建文章" : "在线编辑文章"}
            </h1>
          </div>
          <div className="flex min-w-0 flex-wrap gap-3">
            <AdminSkeleton tone="soft" className="h-4 w-20" />
            <AdminSkeleton tone="soft" className="h-4 w-24" />
          </div>
        </div>
      </div>

      <section
        data-editor-section="metadata"
        className="border-b border-white/10 py-6"
      >
        <div className="border-b border-white/10 pb-4">
          <p className="admin-kicker">Article Metadata</p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-[#edf3e9]">
            文章元数据
          </h2>
        </div>

        <div className="mt-5 grid min-w-0 gap-5">
          <div className="grid min-w-0 gap-5 lg:grid-cols-2">
            <AdminEditorFieldSkeleton label="标题" labelWidth="w-10" />
            <AdminEditorFieldSkeleton label="Slug" labelWidth="w-10" />
          </div>
          <AdminEditorFieldSkeleton label="摘要" labelWidth="w-16" multiline />
          <div className="grid min-w-0 gap-5 lg:grid-cols-2">
            <AdminEditorFieldSkeleton label="分类" labelWidth="w-10" />
            <AdminEditorFieldSkeleton label="发布日期" labelWidth="w-20" />
          </div>
          <div className="grid min-w-0 gap-5 lg:grid-cols-2">
            <AdminEditorFieldSkeleton label="标签" labelWidth="w-10" />
            <AdminEditorFieldSkeleton label="封面（可选）" labelWidth="w-20" />
          </div>
        </div>
      </section>

      <section data-editor-workbench className="mt-6">
        <div className="mb-4 grid grid-cols-2 border border-white/10 bg-white/[0.03] p-1 xl:hidden">
          <AdminStaticAction
            variant="outline"
            className="min-h-10 rounded-none"
          >
            可视化
          </AdminStaticAction>
          <AdminStaticAction
            variant="secondary"
            className="min-h-10 rounded-none text-[#9aa79a]"
          >
            源码
          </AdminStaticAction>
        </div>

        <div className="grid min-w-0 gap-6">
          <section
            data-editor-panel="visual"
            className="min-w-0 overflow-hidden border border-white/10 bg-[#10130f]"
          >
            <div className="flex min-h-16 items-center justify-between gap-3 border-b border-white/10 bg-white/[0.02] px-4 py-3 sm:px-5">
              <div className="min-w-0">
                <p className="admin-kicker-accent">Structured Editor</p>
                <h2 className="mt-1 text-lg font-semibold tracking-tight text-[#edf3e9]">
                  可视化编辑器
                </h2>
              </div>
              <AdminSkeleton tone="soft" className="h-4 w-12" />
            </div>
            <div className="h-[32rem] min-h-0 overflow-hidden">
              <AdminSkeleton className="h-full w-full rounded-none" />
            </div>
          </section>

          <div className="flex min-w-0 flex-wrap items-center justify-end gap-3 border-t border-white/10 pt-5">
            <div className="flex flex-wrap gap-3">
              <AdminStaticAction variant="outline">保存草稿</AdminStaticAction>
              <AdminStaticAction>发布更新</AdminStaticAction>
            </div>
          </div>
        </div>
      </section>
    </section>
  )
}

function AdminArticleHistoryPageSkeleton() {
  return (
    <section className="admin-surface min-w-0 p-4 sm:p-6">
      <div className="flex min-w-0 flex-col gap-4 border-b border-white/10 pb-5">
        <div className="flex min-w-0 flex-wrap items-center gap-3">
          <p
            data-admin-skeleton-kicker="top-level"
            className="admin-kicker-accent"
          >
            Revision History
          </p>
          <AdminAccentSkeleton className="h-7 w-20" />
        </div>

        <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <AdminSkeleton className="h-8 w-64 max-w-full" />
          </div>
          <div className="flex min-w-0 flex-wrap gap-4">
            <span className="admin-link">返回编辑页</span>
            <AdminSkeleton tone="soft" className="h-4 w-24" />
          </div>
        </div>

        <div className="flex min-w-0 flex-wrap gap-x-5 gap-y-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <AdminSkeleton key={index} tone="soft" className="h-4 w-20" />
          ))}
        </div>

        <AdminSkeleton tone="soft" className="h-4 w-52 max-w-full" />
      </div>

      <div className="mt-6 grid min-w-0 gap-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <AdminListCardSkeleton
            key={index}
            muted
            showTags
            showDetails
            showActionRow={false}
            actionCount={1}
            actionTones={["accent"]}
            sideActionLabels={["恢复这个版本"]}
          />
        ))}
      </div>
    </section>
  )
}

export {
  AdminAccountPageSkeleton,
  AdminArticleEditorPageSkeleton,
  AdminArticleHistoryPageSkeleton,
  AdminArticlesPageSkeleton,
  AdminCommentsPageSkeleton,
  AdminDashboardPageSkeleton,
  AdminLoginPageSkeleton,
  AdminProtectedPageSkeleton,
  AdminSettingsPageSkeleton,
  AdminStatsPageSkeleton,
  AdminTagsPageSkeleton,
}
