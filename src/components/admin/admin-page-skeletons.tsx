import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

type AdminSkeletonTone = "soft" | "accent" | "inverse"
type AdminActionTone = AdminSkeletonTone | "danger"

type AdminSkeletonProps = {
  className?: string
  tone?: AdminSkeletonTone
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

function AdminMetricCardSkeleton() {
  return (
    <article className="admin-surface min-w-0 px-5 py-5">
      <AdminSkeleton tone="soft" className="h-4 w-24 max-w-full" />
      <AdminSkeleton className="mt-4 h-8 w-16" />
      <AdminSkeleton tone="soft" className="mt-3 h-4 w-full" />
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
}: {
  muted?: boolean
  showTags?: boolean
  showActionRow?: boolean
  actionCount?: number
  metaCount?: number
  showDetails?: boolean
  actionTones?: AdminActionTone[]
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
              {Array.from({ length: 3 }).map((_, index) => (
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
            {Array.from({ length: actionCount }).map((_, index) => (
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
  titleWidth = "w-56",
  descWidth = "max-w-2xl",
  kicker = "accent",
  action = false,
  status = false,
}: {
  titleWidth?: string
  descWidth?: string
  kicker?: "accent" | "default"
  action?: boolean
  status?: boolean
}) {
  return (
    <header className="flex min-w-0 flex-col gap-4 border-b border-white/10 pb-5 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0">
        {kicker === "accent" ? (
          <AdminAccentSkeleton className="h-4 w-32 max-w-full" />
        ) : (
          <AdminSkeleton tone="soft" className="h-4 w-28 max-w-full" />
        )}
        <AdminSkeleton className={cn("mt-3 h-10 max-w-full", titleWidth)} />
        <AdminSkeleton
          tone="soft"
          className={cn("mt-2 h-4 w-full", descWidth)}
        />
      </div>

      {action ? <AdminAccentSkeleton className="h-10 w-28" /> : null}
      {status ? <AdminAccentSkeleton className="h-7 w-24" /> : null}
    </header>
  )
}

function AdminEditorFieldSkeleton({
  labelWidth = "w-16",
  multiline = false,
  className,
}: {
  labelWidth?: string
  multiline?: boolean
  className?: string
}) {
  return (
    <div className={cn("grid min-w-0 gap-2", className)}>
      <AdminSkeleton tone="soft" className={cn("h-4", labelWidth)} />
      <AdminSkeleton
        className={cn("min-w-0", multiline ? "h-28 min-h-[7rem]" : "h-12")}
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
            <AdminAccentSkeleton className="size-11 rounded-lg" />
            <div className="space-y-3">
              <AdminAccentSkeleton className="h-4 w-24" />
              <AdminSkeleton className="h-10 w-full max-w-sm" />
              <AdminSkeleton tone="soft" className="h-5 w-4/5 max-w-md" />
            </div>
          </div>

          <div className="space-y-4">
            <AdminSkeleton tone="soft" className="h-px w-full" />
            <div className="flex flex-wrap items-center justify-between gap-4">
              <AdminSkeleton tone="soft" className="h-4 w-28" />
              <AdminSkeleton tone="soft" className="h-4 w-36" />
            </div>
          </div>
        </div>

        <div className="grid min-w-0 gap-5 px-6 py-8 sm:px-8 sm:py-10">
          <div>
            <AdminSkeleton className="h-5 w-28" />
            <AdminSkeleton tone="soft" className="mt-2 h-4 w-40" />
          </div>
          <AdminEditorFieldSkeleton labelWidth="w-12" />
          <AdminEditorFieldSkeleton labelWidth="w-12" />
          <AdminAccentSkeleton className="h-10 w-full" />
        </div>
      </section>
    </main>
  )
}

function AdminDashboardPanelSkeleton({ muted = false }: { muted?: boolean }) {
  return (
    <article
      className={cn(
        "min-w-0 px-5 py-5 sm:px-6 sm:py-6",
        muted ? "admin-surface-muted" : "admin-surface"
      )}
    >
      <div className="flex min-w-0 items-center justify-between gap-4">
        <div className="min-w-0">
          <AdminAccentSkeleton className="h-4 w-24 max-w-full" />
          <AdminSkeleton className="mt-2 h-8 w-32 max-w-full" />
        </div>
        <AdminSkeleton tone="soft" className="h-4 w-24 max-w-full" />
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
      <AdminPageHeaderSkeleton titleWidth="w-64" descWidth="max-w-2xl" status />

      <section className="grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <AdminMetricCardSkeleton key={index} />
        ))}
      </section>

      <section className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <AdminDashboardPanelSkeleton />
        <AdminDashboardPanelSkeleton muted />
      </section>

      <section className="grid min-w-0 gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <AdminMetricCardSkeleton key={index} />
        ))}
      </section>
    </div>
  )
}

function AdminProtectedPageSkeleton() {
  return (
    <div className="grid min-w-0 gap-6">
      <AdminPageHeaderSkeleton titleWidth="w-56" descWidth="max-w-xl" />

      <section className="grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <AdminMetricCardSkeleton key={index} />
        ))}
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
      <AdminPageHeaderSkeleton titleWidth="w-56" descWidth="max-w-3xl" action />

      <div className="mt-6 grid min-w-0 gap-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <AdminListCardSkeleton
            key={index}
            muted
            showTags
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
        titleWidth="w-44"
        descWidth="max-w-3xl"
        kicker="default"
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
        titleWidth="w-40"
        descWidth="max-w-3xl"
        kicker="default"
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
                  <AdminSkeleton className="h-12 min-w-0 flex-1" />
                  <AdminSkeleton tone="soft" className="h-10 w-full sm:w-24" />
                </div>
                <AdminDangerSkeleton className="h-10 w-40" />
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
        titleWidth="w-40"
        descWidth="max-w-3xl"
        kicker="default"
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
            <tr className="h-11 text-left">
              {Array.from({ length: 7 }).map((_, index) => (
                <th key={index} className="px-4 py-2">
                  <AdminSkeleton tone="soft" className="h-4 w-16" />
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
      <AdminPageHeaderSkeleton titleWidth="w-48" descWidth="max-w-xl" />

      <div className="mt-6 grid min-w-0 gap-6 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <div className="grid min-w-0 gap-6">
          <section className="admin-surface-muted min-w-0 px-5 py-5">
            <div className="flex min-w-0 items-start gap-4">
              <AdminSkeleton className="size-16 shrink-0" />
              <div className="min-w-0 flex-1">
                <AdminSkeleton className="h-6 w-28 max-w-full" />
                <AdminSkeleton
                  tone="soft"
                  className="mt-2 h-4 w-44 max-w-full"
                />
                <div className="mt-3 flex flex-wrap gap-2">
                  <AdminAccentSkeleton className="h-7 w-16" />
                  <AdminSkeleton tone="soft" className="h-7 w-20" />
                </div>
              </div>
            </div>
          </section>

          <AdminAccountFormSkeleton fieldCount={3} />
          <AdminAccountFormSkeleton fieldCount={3} labelWidth="w-20" />
        </div>

        <section className="admin-surface-muted min-w-0 px-5 py-5">
          <div className="flex min-w-0 flex-col gap-3 border-b border-white/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <AdminSkeleton tone="soft" className="h-4 w-24" />
              <AdminSkeleton className="mt-2 h-8 w-32 max-w-full" />
            </div>
            <AdminSkeleton tone="soft" className="h-7 w-20" />
          </div>

          <div className="mt-5 grid min-w-0 gap-3">
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
  fieldCount,
  labelWidth = "w-16",
}: {
  fieldCount: number
  labelWidth?: string
}) {
  return (
    <section className="admin-surface-muted min-w-0 px-5 py-5">
      <div className="mb-5">
        <AdminSkeleton tone="soft" className="h-4 w-20" />
        <AdminSkeleton className="mt-2 h-8 w-32 max-w-full" />
      </div>
      <div className="grid min-w-0 gap-4">
        {Array.from({ length: fieldCount }).map((_, index) => (
          <AdminEditorFieldSkeleton key={index} labelWidth={labelWidth} />
        ))}
        <AdminAccentSkeleton className="mt-2 h-10 w-full sm:w-28" />
      </div>
    </section>
  )
}

function AdminArticleEditorPageSkeleton() {
  return (
    <section
      data-skeleton-layout="admin-editor"
      className="admin-surface min-w-0 p-4 sm:p-6 lg:p-7"
    >
      <div className="flex min-w-0 flex-col gap-3 border-b border-white/10 pb-5">
        <div className="flex min-w-0 flex-wrap items-center gap-3">
          <AdminAccentSkeleton className="h-4 w-24" />
          <AdminSkeleton tone="soft" className="h-7 w-24" />
        </div>
        <div className="flex min-w-0 flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <AdminSkeleton className="h-10 w-52 max-w-full" />
            <AdminSkeleton tone="soft" className="mt-2 h-4 w-full max-w-xl" />
          </div>
          <div className="flex min-w-0 flex-wrap gap-3">
            <AdminSkeleton tone="soft" className="h-4 w-20" />
            <AdminSkeleton tone="soft" className="h-4 w-24" />
          </div>
        </div>
        <AdminSkeleton tone="soft" className="h-4 w-44 max-w-full" />
      </div>

      <div className="mt-6 grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] xl:items-start">
        <div className="grid min-w-0 gap-5">
          <div className="grid min-w-0 gap-5 lg:grid-cols-2">
            <AdminEditorFieldSkeleton labelWidth="w-10" />
            <AdminEditorFieldSkeleton labelWidth="w-10" />
          </div>
          <AdminEditorFieldSkeleton labelWidth="w-16" multiline />
          <div className="grid min-w-0 gap-5 lg:grid-cols-2">
            <AdminEditorFieldSkeleton labelWidth="w-10" />
            <AdminEditorFieldSkeleton labelWidth="w-20" />
          </div>
          <div className="grid min-w-0 gap-5 lg:grid-cols-2">
            <AdminEditorFieldSkeleton labelWidth="w-10" />
            <AdminEditorFieldSkeleton labelWidth="w-20" />
          </div>
          <AdminEditorFieldSkeleton
            labelWidth="w-12"
            multiline
            className="min-h-[24rem]"
          />
          <div className="flex min-w-0 flex-wrap gap-3">
            <AdminSkeleton tone="soft" className="h-10 w-28" />
            <AdminAccentSkeleton className="h-10 w-28" />
          </div>
        </div>

        <section className="admin-surface-muted min-w-0 px-4 py-5 sm:px-6 sm:py-6">
          <div className="flex min-w-0 flex-col gap-3 border-b border-white/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <AdminAccentSkeleton className="h-4 w-24" />
              <AdminSkeleton className="mt-2 h-8 w-28 max-w-full" />
            </div>
            <AdminSkeleton tone="soft" className="h-4 w-24 max-w-full" />
          </div>

          <div className="mt-6 grid min-h-[30rem] min-w-0 content-start gap-4">
            <AdminSkeleton className="h-6 w-24" />
            <AdminSkeleton className="h-14 w-full" />
            <AdminSkeleton className="h-14 w-4/5 max-w-full" />
            <AdminSkeleton tone="soft" className="h-5 w-full" />
            <AdminSkeleton tone="soft" className="h-5 w-5/6 max-w-full" />
            <AdminSkeleton tone="soft" className="h-64 w-full rounded-md" />
          </div>
        </section>
      </div>
    </section>
  )
}

function AdminArticleHistoryPageSkeleton() {
  return (
    <section className="admin-surface min-w-0 p-4 sm:p-6">
      <div className="flex min-w-0 flex-col gap-4 border-b border-white/10 pb-5">
        <div className="flex min-w-0 flex-wrap items-center gap-3">
          <AdminSkeleton tone="soft" className="h-4 w-28" />
          <AdminAccentSkeleton className="h-7 w-20" />
        </div>

        <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <AdminSkeleton className="h-10 w-64 max-w-full" />
            <AdminSkeleton tone="soft" className="mt-2 h-4 w-full max-w-xl" />
          </div>
          <div className="flex min-w-0 flex-wrap gap-4">
            <AdminSkeleton tone="soft" className="h-4 w-20" />
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
  AdminStatsPageSkeleton,
  AdminTagsPageSkeleton,
}
