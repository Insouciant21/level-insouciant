import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

type AdminSkeletonProps = {
  className?: string
}

function AdminSkeleton({ className }: AdminSkeletonProps) {
  return <Skeleton className={cn("border-none bg-white/10 shadow-none", className)} />
}

function AdminAccentSkeleton({ className }: AdminSkeletonProps) {
  return <Skeleton className={cn("border-none bg-[#4ade80]/18 shadow-none", className)} />
}

function AdminWarmSkeleton({ className }: AdminSkeletonProps) {
  return <Skeleton className={cn("border-none bg-red-500/18 shadow-none", className)} />
}

function AdminMetricCardSkeleton() {
  return (
    <article className="admin-surface px-5 py-5">
      <AdminSkeleton className="h-4 w-24" />
      <AdminSkeleton className="mt-4 h-8 w-16 bg-white/14" />
      <AdminSkeleton className="mt-3 h-4 w-full bg-white/8" />
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
}: {
  muted?: boolean
  showTags?: boolean
  showActionRow?: boolean
  actionCount?: number
  metaCount?: number
  showDetails?: boolean
}) {
  return (
    <article className={muted ? "admin-surface-muted px-5 py-5" : "admin-surface px-5 py-5"}>
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <AdminSkeleton className="h-6 w-48 bg-white/14" />
            <AdminAccentSkeleton className="h-7 w-20" />
            <AdminSkeleton className="h-4 w-28 bg-white/8" />
          </div>

          <AdminSkeleton className="mt-3 h-4 w-full bg-white/8" />
          <AdminSkeleton className="mt-2 h-4 w-5/6 bg-white/8" />

          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
            {Array.from({ length: metaCount }).map((_, index) => (
              <AdminSkeleton key={index} className="h-4 w-20 bg-white/8" />
            ))}
          </div>

          {showTags ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <AdminSkeleton key={index} className="h-7 w-16 bg-white/8" />
              ))}
            </div>
          ) : null}

          {showActionRow ? (
            <div className="mt-4 flex flex-wrap gap-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <AdminAccentSkeleton key={index} className="h-4 w-20" />
              ))}
            </div>
          ) : null}

          {showDetails ? (
            <div className="mt-4 rounded-2xl border border-white/10 bg-[#111111] px-4 py-3">
              <AdminSkeleton className="h-4 w-28 bg-white/10" />
              <AdminSkeleton className="mt-4 h-4 w-full bg-white/8" />
              <AdminSkeleton className="mt-2 h-4 w-full bg-white/8" />
              <AdminSkeleton className="mt-2 h-4 w-5/6 bg-white/8" />
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-3 xl:max-w-xs xl:justify-end">
          {Array.from({ length: actionCount }).map((_, index) => (
            <AdminSkeleton
              key={index}
              className={cn(
                "h-10 w-24",
                index === actionCount - 1 ? "bg-[#1a2e1a]" : "bg-white/10"
              )}
            />
          ))}
        </div>
      </div>
    </article>
  )
}

function AdminPageHeaderSkeleton({
  titleWidth = "w-56",
  descWidth = "max-w-2xl",
  kicker = "accent",
  action = false,
}: {
  titleWidth?: string
  descWidth?: string
  kicker?: "accent" | "default"
  action?: boolean
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-white/10 pb-5 lg:flex-row lg:items-end lg:justify-between">
      <div>
        {kicker === "accent" ? (
          <AdminAccentSkeleton className="h-4 w-32" />
        ) : (
          <AdminSkeleton className="h-4 w-28" />
        )}
        <AdminSkeleton className={cn("mt-3 h-10 bg-white/14", titleWidth)} />
        <AdminSkeleton className={cn("mt-2 h-4 w-full bg-white/8", descWidth)} />
      </div>

      {action ? <AdminSkeleton className="h-10 w-28 bg-[#1a2e1a]" /> : null}
    </div>
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
    <div className={cn("grid gap-2", className)}>
      <AdminSkeleton className={cn("h-4 bg-white/10", labelWidth)} />
      <AdminSkeleton className={multiline ? "h-28 bg-white/10" : "h-12 bg-white/10"} />
    </div>
  )
}

function AdminLoginPageSkeleton() {
  return (
    <main className="admin-console flex min-h-svh flex-1 items-center justify-center bg-[#111111] px-5 py-16 sm:px-6 lg:px-8">
      <section className="terminal-panel grid w-full max-w-6xl gap-8 px-6 py-8 sm:px-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <div className="relative z-10 space-y-4">
          <AdminWarmSkeleton className="h-4 w-24" />
          <AdminSkeleton className="h-14 w-full max-w-xl bg-white/12" />
          <AdminSkeleton className="h-5 w-4/5 max-w-md bg-white/8" />
          <div className="admin-surface-muted px-5 py-5">
            <AdminWarmSkeleton className="h-4 w-24" />
            <AdminSkeleton className="mt-3 h-4 w-full bg-white/8" />
            <AdminSkeleton className="mt-2 h-4 w-5/6 bg-white/8" />
          </div>
        </div>

        <div className="relative z-10 grid gap-4">
          <AdminEditorFieldSkeleton labelWidth="w-12" />
          <AdminEditorFieldSkeleton labelWidth="w-12" />
          <AdminSkeleton className="h-10 w-full bg-[#1a2e1a]" />
        </div>
      </section>
    </main>
  )
}

function AdminDashboardPageSkeleton() {
  return (
    <div className="grid gap-8">
      <header className="border-b border-white/10 pb-6">
        <AdminAccentSkeleton className="h-4 w-40" />
        <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <AdminSkeleton className="h-12 w-64 bg-white/14" />
            <AdminSkeleton className="mt-3 h-5 w-full max-w-2xl bg-white/8" />
          </div>
          <AdminAccentSkeleton className="h-8 w-32 bg-[#1a2e1a]" />
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <AdminMetricCardSkeleton key={index} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <AdminListCardSkeleton showTags={false} showActionRow={false} actionCount={0} metaCount={1} />
        <AdminListCardSkeleton muted showTags={false} showActionRow={false} actionCount={0} metaCount={1} />
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <AdminMetricCardSkeleton key={index} />
        ))}
      </section>
    </div>
  )
}

function AdminProtectedPageSkeleton() {
  return (
    <div className="grid gap-6">
      <header className="border-b border-white/10 pb-5">
        <AdminAccentSkeleton className="h-4 w-32" />
        <AdminSkeleton className="mt-3 h-10 w-56 bg-white/14" />
        <AdminSkeleton className="mt-2 h-4 w-full max-w-xl bg-white/8" />
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <AdminMetricCardSkeleton key={index} />
        ))}
      </section>

      <section className="grid gap-4">
        {Array.from({ length: 2 }).map((_, index) => (
          <AdminListCardSkeleton key={index} muted showTags={index === 0} />
        ))}
      </section>
    </div>
  )
}

function AdminArticlesPageSkeleton() {
  return (
    <section className="admin-surface px-6 py-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-2">
          <AdminSkeleton className="h-4 w-28" />
          <AdminSkeleton className="h-10 w-56 bg-white/14" />
          <AdminSkeleton className="h-4 w-full max-w-3xl bg-white/8" />
        </div>
        <AdminSkeleton className="h-10 w-28 bg-[#1a2e1a]" />
      </div>

      <div className="mt-6 grid gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <AdminListCardSkeleton key={index} muted showTags />
        ))}
      </div>
    </section>
  )
}

function AdminCommentsPageSkeleton() {
  return (
    <section className="admin-surface px-6 py-6">
      <div className="flex flex-col gap-2">
        <AdminSkeleton className="h-4 w-32" />
        <AdminSkeleton className="h-10 w-44 bg-white/14" />
        <AdminSkeleton className="h-4 w-full max-w-3xl bg-white/8" />
      </div>

      <div className="mt-6 grid gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <AdminListCardSkeleton key={index} muted metaCount={2} showActionRow={false} />
        ))}
      </div>
    </section>
  )
}

function AdminTagsPageSkeleton() {
  return (
    <section className="admin-surface px-6 py-6">
      <div className="flex flex-col gap-2">
        <AdminSkeleton className="h-4 w-28" />
        <AdminSkeleton className="h-10 w-40 bg-white/14" />
        <AdminSkeleton className="h-4 w-full max-w-3xl bg-white/8" />
      </div>

      <div className="mt-6 grid gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <article key={index} className="admin-surface-muted px-5 py-5">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <AdminSkeleton className="h-6 w-24 bg-white/14" />
                  <AdminAccentSkeleton className="h-7 w-20 bg-white/10" />
                </div>
                <AdminSkeleton className="mt-3 h-4 w-full bg-white/8" />
                <AdminSkeleton className="mt-2 h-4 w-5/6 bg-white/8" />
              </div>

              <div className="grid gap-3 xl:min-w-[24rem]">
                <div className="flex flex-col gap-3 sm:flex-row">
                  <AdminSkeleton className="h-12 min-w-0 flex-1 bg-white/10" />
                  <AdminSkeleton className="h-10 w-full bg-white/10 sm:w-24" />
                </div>
                <AdminSkeleton className="h-10 w-40 bg-red-900/45" />
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
    <section className="admin-surface px-6 py-6">
      <div className="flex flex-col gap-2">
        <AdminSkeleton className="h-4 w-32" />
        <AdminSkeleton className="h-10 w-40 bg-white/14" />
        <AdminSkeleton className="h-4 w-full max-w-3xl bg-white/8" />
      </div>

      <div className="mt-6 overflow-x-auto">
        <div className="overflow-hidden border border-[#333333] bg-[#111111] shadow-[0_24px_48px_-36px_rgba(0,0,0,0.72)]">
          <table className="min-w-full border-collapse">
            <thead className="bg-[#0a0a0a]">
              <tr className="text-left">
                {Array.from({ length: 7 }).map((_, index) => (
                  <th key={index} className="px-4 py-2">
                    <AdminSkeleton className="h-4 w-16 bg-white/8" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222222]">
              {Array.from({ length: 5 }).map((_, index) => (
                <tr key={index}>
                  <td className="px-4 py-4">
                    <AdminSkeleton className="h-5 w-36 bg-white/12" />
                    <AdminSkeleton className="mt-2 h-4 w-24 bg-white/8" />
                  </td>
                  {Array.from({ length: 5 }).map((_, cellIndex) => (
                    <td key={cellIndex} className="px-4 py-4">
                      <AdminSkeleton className="h-4 w-16 bg-white/8" />
                    </td>
                  ))}
                  <td className="px-4 py-4">
                    <AdminSkeleton className="h-4 w-16 bg-white/8" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

function AdminAccountPageSkeleton() {
  return (
    <section className="admin-surface px-6 py-6">
      <AdminPageHeaderSkeleton titleWidth="w-48" descWidth="max-w-xl" />

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <div className="grid gap-6">
          <section className="admin-surface-muted px-5 py-5">
            <div className="flex items-start gap-4">
              <AdminSkeleton className="size-16 bg-white/12" />
              <div className="min-w-0 flex-1">
                <AdminSkeleton className="h-6 w-28 bg-white/14" />
                <AdminSkeleton className="mt-2 h-4 w-44 bg-white/8" />
                <div className="mt-3 flex flex-wrap gap-2">
                  <AdminAccentSkeleton className="h-7 w-16 bg-[#1a2e1a]" />
                  <AdminSkeleton className="h-7 w-20 bg-white/8" />
                </div>
              </div>
            </div>
          </section>

          <section className="admin-surface-muted px-5 py-5">
            <div className="mb-5">
              <AdminSkeleton className="h-4 w-20" />
              <AdminSkeleton className="mt-2 h-8 w-32 bg-white/14" />
            </div>
            <div className="grid gap-4">
              <AdminEditorFieldSkeleton />
              <AdminEditorFieldSkeleton />
              <AdminEditorFieldSkeleton labelWidth="w-20" />
              <AdminSkeleton className="mt-2 h-10 w-full bg-[#1a2e1a] sm:w-28" />
            </div>
          </section>

          <section className="admin-surface-muted px-5 py-5">
            <div className="mb-5">
              <AdminSkeleton className="h-4 w-24" />
              <AdminSkeleton className="mt-2 h-8 w-32 bg-white/14" />
            </div>
            <div className="grid gap-4">
              <AdminEditorFieldSkeleton labelWidth="w-16" />
              <AdminEditorFieldSkeleton labelWidth="w-16" />
              <AdminEditorFieldSkeleton labelWidth="w-20" />
              <AdminSkeleton className="mt-2 h-10 w-full bg-[#1a2e1a] sm:w-28" />
            </div>
          </section>
        </div>

        <section className="admin-surface-muted px-5 py-5">
          <div className="flex flex-col gap-3 border-b border-white/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <AdminSkeleton className="h-4 w-24" />
              <AdminSkeleton className="mt-2 h-8 w-32 bg-white/14" />
            </div>
            <AdminSkeleton className="h-7 w-20 bg-white/8" />
          </div>

          <div className="mt-5 grid gap-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <AdminListCardSkeleton key={index} actionCount={2} metaCount={1} showActionRow={false} />
            ))}
          </div>
        </section>
      </div>
    </section>
  )
}

function AdminArticleEditorPageSkeleton() {
  return (
    <section className="admin-surface px-6 py-6 sm:px-7">
      <div className="flex flex-col gap-3 border-b border-white/10 pb-5">
        <div className="flex flex-wrap items-center gap-3">
          <AdminAccentSkeleton className="h-4 w-24" />
          <AdminSkeleton className="h-7 w-24 bg-white/8" />
        </div>
        <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <AdminSkeleton className="h-10 w-52 bg-white/14" />
            <AdminSkeleton className="mt-2 h-4 w-full max-w-xl bg-white/8" />
          </div>
          <div className="flex flex-wrap gap-3">
            <AdminAccentSkeleton className="h-4 w-20" />
            <AdminAccentSkeleton className="h-4 w-24" />
          </div>
        </div>
        <AdminSkeleton className="h-4 w-44 bg-white/8" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] xl:items-start">
        <div className="grid gap-5">
          <div className="grid gap-5 lg:grid-cols-2">
            <AdminEditorFieldSkeleton labelWidth="w-10" />
            <AdminEditorFieldSkeleton labelWidth="w-10" />
          </div>
          <AdminEditorFieldSkeleton labelWidth="w-16" multiline />
          <div className="grid gap-5 lg:grid-cols-2">
            <AdminEditorFieldSkeleton labelWidth="w-10" />
            <AdminEditorFieldSkeleton labelWidth="w-20" />
          </div>
          <div className="grid gap-5 lg:grid-cols-2">
            <AdminEditorFieldSkeleton labelWidth="w-10" />
            <AdminEditorFieldSkeleton labelWidth="w-20" />
          </div>
          <AdminEditorFieldSkeleton labelWidth="w-12" multiline className="min-h-[24rem]" />
          <div className="flex flex-wrap gap-3">
            <AdminSkeleton className="h-10 w-28 bg-[#1a2e1a]" />
            <AdminSkeleton className="h-10 w-28 bg-white/10" />
          </div>
        </div>

        <section className="admin-surface-muted px-6 py-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <AdminAccentSkeleton className="h-4 w-24" />
              <AdminSkeleton className="mt-2 h-8 w-28 bg-white/14" />
            </div>
            <AdminSkeleton className="h-8 w-20 bg-white/8" />
          </div>

          <div className="mt-6 grid gap-4">
            <AdminSkeleton className="h-6 w-24 bg-white/14" />
            <AdminSkeleton className="h-14 w-full bg-white/10" />
            <AdminSkeleton className="h-14 w-4/5 bg-white/10" />
            <AdminSkeleton className="h-5 w-full bg-white/8" />
            <AdminSkeleton className="h-5 w-5/6 bg-white/8" />
            <AdminSkeleton className="h-64 w-full rounded-[1.75rem] bg-white/8" />
          </div>
        </section>
      </div>
    </section>
  )
}

function AdminArticleHistoryPageSkeleton() {
  return (
    <section className="admin-surface px-6 py-6">
      <div className="flex flex-col gap-4 border-b border-white/10 pb-5">
        <div className="flex flex-wrap items-center gap-3">
          <AdminSkeleton className="h-4 w-28" />
          <AdminAccentSkeleton className="h-7 w-20 bg-white/10" />
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <AdminSkeleton className="h-10 w-64 bg-white/14" />
            <AdminSkeleton className="mt-2 h-4 w-full max-w-xl bg-white/8" />
          </div>
          <div className="flex flex-wrap gap-4">
            <AdminAccentSkeleton className="h-4 w-20" />
            <AdminAccentSkeleton className="h-4 w-24" />
          </div>
        </div>

        <div className="flex flex-wrap gap-x-5 gap-y-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <AdminSkeleton key={index} className="h-4 w-20 bg-white/8" />
          ))}
        </div>

        <AdminSkeleton className="h-4 w-52 bg-white/8" />
      </div>

      <div className="mt-6 grid gap-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <AdminListCardSkeleton
            key={index}
            muted
            showTags
            showDetails
            showActionRow={false}
            actionCount={1}
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
