import { PageShell } from "@/components/blog/page-shell"
import { Skeleton } from "@/components/ui/skeleton"

const skeletonPanelClass =
  "public-summary-panel"
const skeletonDocumentClass =
  "public-summary-panel-document"
const skeletonCardClass =
  "public-summary-card"
const skeletonSoftCardClass =
  "public-summary-card-muted border-[#73766f]/46 bg-[#aaa891]/28 shadow-[inset_0_1px_0_rgba(255,252,225,0.12),0_14px_28px_-28px_rgba(0,0,0,0.26)]"

function DoorCardSkeleton({ featured = false }: { featured?: boolean }) {
  return (
    <article
      className={[
        "door-card relative overflow-hidden border-[3px]",
        featured
          ? "min-h-[16rem] border-[#73766f]/60 sm:min-h-[18rem] lg:col-span-2 lg:row-span-2 lg:min-h-[24rem]"
          : "min-h-[16rem] border-[#73766f]/50 sm:min-h-[18rem]",
      ].join(" ")}
    >
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,252,225,0.12),transparent_38%,rgba(24,27,23,0.08))]" />
      <div className="absolute inset-0 shadow-[inset_0_0_44px_rgba(24,27,23,0.16)]" />

      <div className="relative z-10 flex h-full flex-col px-4 py-4 sm:px-6 sm:py-6">
        <div className="flex items-start gap-3 sm:gap-4">
          <Skeleton className="h-5 w-16 border-black/15 bg-black/80 shadow-none" />
        </div>

        <div className="mt-auto space-y-4">
          <div className={`${skeletonSoftCardClass} px-4 py-4 backdrop-blur-sm`}>
            <Skeleton className="h-3 w-32" />
            <Skeleton className="mt-4 h-10 w-full max-w-lg" />
            <Skeleton className="mt-2 h-10 w-4/5 max-w-md" />
            <Skeleton className="mt-5 h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-5/6" />

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-black/10 pt-4">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}

function ArticleCardSkeleton() {
  return <DoorCardSkeleton />
}

function PageIntroSkeleton() {
  return (
    <section className="max-w-5xl border-l-[3px] border-foreground/18 pl-5">
      <Skeleton className="h-4 w-28" />
      <div className="mt-4 space-y-4">
        <Skeleton className="h-12 w-72 max-w-full" />
        <Skeleton className="h-5 w-full max-w-3xl" />
        <Skeleton className="h-5 w-5/6 max-w-2xl" />
        <Skeleton className="h-px w-full max-w-3xl border-none bg-foreground/14 shadow-none" />
      </div>
    </section>
  )
}

function HomeHeroSkeleton() {
  return (
    <section className="overflow-hidden px-1">
      <div className="grid min-h-[24rem] gap-10">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.12fr)_minmax(300px,0.88fr)] lg:items-start">
          <div className="space-y-6">
            <Skeleton className="h-4 w-36" />
            <div className="space-y-5">
              <Skeleton className="h-16 w-full max-w-5xl" />
              <Skeleton className="h-16 w-5/6 max-w-4xl" />
              <Skeleton className="h-6 w-full max-w-2xl" />
              <Skeleton className="h-6 w-4/5 max-w-xl" />
            </div>
            <div className="flex flex-wrap gap-3">
              <Skeleton className="h-11 w-40 border-primary/40 bg-primary/70 shadow-none" />
              <Skeleton className="h-11 w-36 border-[#73766f]/32 bg-[#d9d1ad]/52 shadow-none" />
            </div>
          </div>

          <aside className="flex lg:justify-end">
            <div className={`${skeletonPanelClass} w-full max-w-md px-5 py-5`}>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="mt-4 h-5 w-full" />
              <Skeleton className="mt-2 h-5 w-5/6" />
              <Skeleton className="mt-2 h-5 w-4/5" />
            </div>
          </aside>
        </div>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(340px,0.8fr)] xl:items-end">
          <div className="grid gap-4 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className={`${skeletonCardClass} relative isolate overflow-hidden px-5 py-5`}>
                <Skeleton className="h-4 w-20" />
                <Skeleton className="mt-4 h-8 w-16" />
              </div>
            ))}
          </div>

          <div className={`${skeletonPanelClass} border-dashed px-5 py-4`}>
            <Skeleton className="h-4 w-28" />
            <Skeleton className="mt-3 h-5 w-full" />
            <Skeleton className="mt-2 h-5 w-4/5" />
          </div>
        </div>
      </div>
    </section>
  )
}

function TimelinePanelSkeleton() {
  return (
    <section className={`${skeletonPanelClass} px-6 py-6 sm:px-7`}>
      <Skeleton className="h-4 w-28" />
      <Skeleton className="mt-2 h-8 w-36" />

      <div className="mt-6 grid gap-5">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="grid grid-cols-[auto_1fr] gap-4">
            <div className="flex flex-col items-center pt-1">
              <Skeleton className="size-3 border-black/15 bg-primary shadow-none" />
              {index < 3 ? <div className="mt-2 h-full w-px bg-[#73766f]/42" /> : null}
            </div>

            <div className={`${skeletonSoftCardClass} space-y-2 px-4 py-4`}>
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function TagCloudPanelSkeleton() {
  return (
    <section className={`${skeletonPanelClass} px-6 py-6 sm:px-7`}>
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <Skeleton className="h-4 w-20" />
          <Skeleton className="mt-2 h-8 w-32" />
        </div>
        <Skeleton className="h-8 w-20" />
      </div>

      <div className="flex flex-wrap gap-3">
        {Array.from({ length: 8 }).map((_, index) => (
          <Skeleton
            key={index}
            className={index % 3 === 0 ? "h-10 w-28" : index % 3 === 1 ? "h-10 w-24" : "h-10 w-20"}
          />
        ))}
      </div>
    </section>
  )
}

function ProfilePanelSkeleton() {
  return (
    <section className={`${skeletonPanelClass} px-6 py-6 sm:px-7`}>
      <div className="space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Skeleton className="h-4 w-28" />
            <Skeleton className="mt-2 h-8 w-40" />
          </div>
          <Skeleton className="h-8 w-20 border-[#73766f]/32 bg-[#d9d1ad]/48 shadow-none" />
        </div>

        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-5/6" />

        <div className="flex items-center gap-2">
          <Skeleton className="size-4 border-none bg-black/18 shadow-none" />
          <Skeleton className="h-4 w-36" />
        </div>

        <div className="grid gap-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-14 w-full" />
          ))}
        </div>

        <Skeleton className="h-4 w-44" />
      </div>
    </section>
  )
}

function HomePageSkeleton() {
  return (
    <PageShell className="gap-12 lg:gap-16">
      <HomeHeroSkeleton />

      <section className="grid gap-6">
        <div className="max-w-3xl border-l-[3px] border-foreground/18 pl-5">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="mt-3 h-12 w-full max-w-2xl" />
          <Skeleton className="mt-2 h-12 w-4/5 max-w-xl" />
          <Skeleton className="mt-4 h-5 w-full max-w-3xl" />
          <Skeleton className="mt-2 h-5 w-5/6 max-w-2xl" />
        </div>

        <div className="grid auto-rows-[16rem] gap-4 sm:auto-rows-[18rem] sm:gap-6 md:grid-cols-2 lg:grid-cols-4 xl:gap-10">
          {Array.from({ length: 6 }).map((_, index) => (
            <DoorCardSkeleton key={index} featured={index === 0 || index === 3} />
          ))}

          <div className="relative flex min-h-[16rem] flex-col items-center justify-center overflow-hidden border-[3px] border-[#2d2d2d] bg-[#1a1a1a] px-4 shadow-[inset_0_0_60px_rgba(0,0,0,0.7)] sm:min-h-[18rem]">
            <Skeleton className="h-4 w-28 border-[#8a4f34]/70 bg-[#8a4f34]/70 shadow-none" />
            <Skeleton className="absolute bottom-4 left-4 h-3 w-24 border-none bg-[#73766f]/26 shadow-none" />
          </div>
        </div>
      </section>

      <section className="grid gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-3xl space-y-3">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-10 w-44" />
            <Skeleton className="h-5 w-full max-w-3xl" />
            <Skeleton className="h-5 w-5/6 max-w-2xl" />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Skeleton className="h-8 w-28" />
            <Skeleton className="h-9 w-28 border-[#73766f]/32 bg-[#d9d1ad]/52 shadow-none" />
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <ArticleCardSkeleton key={index} />
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
        <TimelinePanelSkeleton />

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-1">
          <TagCloudPanelSkeleton />
          <ProfilePanelSkeleton />
        </div>
      </section>
    </PageShell>
  )
}

function ArticlesPageSkeleton() {
  return (
    <PageShell>
      <PageIntroSkeleton />
      <section className="grid gap-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <ArticleCardSkeleton key={index} />
        ))}
      </section>
    </PageShell>
  )
}

function ArchiveDirectoryPageSkeleton() {
  return (
    <PageShell>
      <PageIntroSkeleton />
      <section className={`${skeletonPanelClass} space-y-6 px-6 py-6 sm:px-7`}>
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-8 w-20" />
        </div>

        <div className="grid gap-3">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className={`${skeletonCardClass} flex items-center justify-between px-4 py-3.5`}>
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-10" />
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  )
}

function ArchiveDetailPageSkeleton() {
  return (
    <PageShell>
      <PageIntroSkeleton />
      <section className="grid gap-5">
        {Array.from({ length: 4 }).map((_, index) => (
          <ArticleCardSkeleton key={index} />
        ))}
      </section>
    </PageShell>
  )
}

function TagAggregateBlockSkeleton() {
  return (
    <section className={`${skeletonPanelClass} px-6 py-6 sm:px-7`}>
      <div className="flex flex-col gap-4 border-b border-border/60 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Skeleton className="h-4 w-16" />
          <Skeleton className="mt-2 h-10 w-40" />
          <Skeleton className="mt-2 h-5 w-full max-w-sm" />
        </div>
        <Skeleton className="h-4 w-28" />
      </div>

      <div className="mt-6 grid gap-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className={`${skeletonCardClass} px-4 py-4`}>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-2">
                <Skeleton className="h-7 w-2/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function TagsPageSkeleton() {
  return (
    <PageShell>
      <PageIntroSkeleton />

      <div className="grid gap-6">
        <section className={`${skeletonPanelClass} px-6 py-6`}>
          <div className="flex flex-col gap-4 border-b border-border/60 pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <Skeleton className="h-4 w-20" />
              <Skeleton className="mt-2 h-8 w-32" />
            </div>
            <Skeleton className="h-4 w-24" />
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {Array.from({ length: 8 }).map((_, index) => (
              <Skeleton
                key={index}
                className={index % 3 === 0 ? "h-10 w-28" : index % 3 === 1 ? "h-10 w-24" : "h-10 w-20"}
              />
            ))}
          </div>
        </section>

        <div className="grid gap-6">
          {Array.from({ length: 2 }).map((_, index) => (
            <TagAggregateBlockSkeleton key={index} />
          ))}
        </div>
      </div>
    </PageShell>
  )
}

function SearchPageSkeleton() {
  return (
    <PageShell className="gap-0 py-0">
      <section className="mx-auto w-full max-w-[800px] px-6 py-20">
        <div className="terminal-panel relative overflow-hidden border-[3px] px-8 py-8 md:px-12 md:py-12">
          <div className="absolute inset-0 opacity-[0.05] bg-[linear-gradient(rgba(255,255,255,0)_50%,rgba(0,0,0,1)_50%)] bg-[length:100%_4px]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.4)_100%)]" />

          <header className="relative z-10 flex items-center justify-between border-b-2 border-primary/20 pb-4">
            <div className="flex items-center gap-4">
              <Skeleton className="size-5 border-none bg-primary/35 shadow-none" />
              <Skeleton className="h-4 w-44 border-none bg-primary/20 shadow-none" />
            </div>
            <Skeleton className="size-5 border-none bg-white/12 shadow-none" />
          </header>

          <div className="relative z-10 mt-12 grid gap-6">
            <Skeleton className="h-4 w-60 border-none bg-primary/20 shadow-none" />

            <div className="flex items-center gap-4 border-l-4 border-primary bg-[#12140f] px-4 py-4">
              <Skeleton className="size-6 border-none bg-primary/22 shadow-none" />
              <Skeleton className="h-12 w-full border-none bg-primary/14 shadow-none" />
            </div>

            <Skeleton className="ml-auto h-12 w-44 border-primary/40 bg-primary/70 shadow-none" />
          </div>

          <div className="relative z-10 mt-12 min-h-[200px] space-y-4">
            <Skeleton className="h-4 w-48 border-none bg-white/10 shadow-none" />
            <Skeleton className="h-4 w-44 border-none bg-white/10 shadow-none" />
            <div className="pt-4">
              <Skeleton className="h-px w-full border-none bg-primary/20 shadow-none" />
            </div>

            <div className="grid gap-4 pt-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex items-center gap-4 border border-primary/10 p-4">
                  <Skeleton className="h-4 w-8 border-none bg-primary/18 shadow-none" />
                  <Skeleton className="h-4 w-full border-none bg-primary/16 shadow-none" />
                  <Skeleton className="h-4 w-8 border-none bg-primary/16 shadow-none" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  )
}

function AboutPageSkeleton() {
  return (
    <PageShell>
      <section className="grid gap-10 lg:grid-cols-[320px_minmax(0,1fr)] lg:items-start">
        <aside className="grid gap-8 lg:sticky lg:top-28">
          <div className="space-y-4 border-r-4 border-foreground/80 pr-6">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-16 w-40" />
            <Skeleton className="h-4 w-44" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-36" />
          </div>

          <div className="flex h-56 items-center justify-center bg-[#1a1a1a] shadow-[inset_0_0_36px_rgba(0,0,0,0.72)]">
            <Skeleton className="size-24 border-none bg-white/8 shadow-none" />
          </div>

          <div className="grid gap-4">
            {Array.from({ length: 2 }).map((_, index) => (
              <div key={index} className="flex items-center justify-between border-b border-border/70 pb-2">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="size-4" />
              </div>
            ))}
          </div>
        </aside>

        <article className={`${skeletonDocumentClass} px-7 py-8 sm:px-10 sm:py-10`}>
          <Skeleton className="h-24 w-full" />

          <div className="mt-8 space-y-4">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-5/6" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-4/5" />
            <Skeleton className="h-5 w-full" />
          </div>

          <div className="mt-12">
            <div className="flex items-center gap-3 border-b-2 border-foreground/80 pb-3">
              <Skeleton className="size-5" />
              <Skeleton className="h-6 w-56" />
            </div>

            <div className="mt-6 grid gap-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className={
                    index === 3
                      ? "border border-[#8a4f34]/70 bg-[#181b17] px-5 py-4"
                      : `${skeletonCardClass} px-5 py-4`
                  }
                >
                  <div className="grid gap-2 md:grid-cols-[180px_minmax(0,1fr)]">
                    <Skeleton className={index === 3 ? "h-4 w-28 border-none bg-white/15 shadow-none" : "h-4 w-28"} />
                    <div className="space-y-2">
                      <Skeleton className={index === 3 ? "h-4 w-full border-none bg-white/12 shadow-none" : "h-4 w-full"} />
                      <Skeleton className={index === 3 ? "h-4 w-5/6 border-none bg-white/12 shadow-none" : "h-4 w-5/6"} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 border-t border-border/60 pt-5 space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-40" />
            </div>
          </div>
        </article>
      </section>
    </PageShell>
  )
}

function AuthPageSkeleton() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 items-center px-5 py-16 sm:px-6 lg:px-8">
      <section className={`${skeletonDocumentClass} grid w-full gap-8 px-6 py-8 sm:px-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]`}>
        <div className="space-y-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-14 w-full max-w-xl" />
          <Skeleton className="h-14 w-4/5 max-w-lg" />
          <Skeleton className="h-5 w-full max-w-xl" />
          <Skeleton className="h-5 w-5/6 max-w-lg" />
          <div className={`${skeletonSoftCardClass} border-dashed px-5 py-5`}>
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-3 h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-5/6" />
          </div>
        </div>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-12 w-full" />
          </div>
          <div className="grid gap-2">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-12 w-full" />
          </div>
          <div className="grid gap-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-12 w-full" />
          </div>
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-px w-full border-none bg-border/70 shadow-none" />
          <Skeleton className="h-4 w-40" />
        </div>
      </section>
    </main>
  )
}

function AccountPageSkeleton() {
  return (
    <PageShell>
      <section className={`${skeletonDocumentClass} px-6 py-6 sm:px-7`}>
        <div className="flex flex-col gap-4 border-b border-border/60 pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <Skeleton className="h-4 w-28" />
            <Skeleton className="mt-2 h-10 w-40" />
          </div>
          <Skeleton className="h-9 w-28" />
        </div>

        <Skeleton className="mt-5 h-4 w-40" />

        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
          <div className="grid gap-6">
            <section className={`${skeletonSoftCardClass} px-5 py-5`}>
              <div className="flex items-start gap-4">
                <Skeleton className="size-16" />
                <div className="space-y-2">
                  <Skeleton className="h-6 w-28" />
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-28" />
                </div>
              </div>
            </section>

            {Array.from({ length: 2 }).map((_, index) => (
              <section key={index} className={`${skeletonSoftCardClass} px-5 py-5`}>
                <div className="mb-5">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="mt-2 h-8 w-32" />
                </div>

                <div className="grid gap-4">
                  {Array.from({ length: 3 }).map((_, fieldIndex) => (
                    <div key={fieldIndex} className="grid gap-2">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-12 w-full" />
                    </div>
                  ))}
                  <Skeleton className="mt-2 h-10 w-full sm:w-28" />
                </div>
              </section>
            ))}
          </div>

          <section className={`${skeletonSoftCardClass} px-5 py-5`}>
            <div className="flex items-center justify-between gap-4">
              <div>
                <Skeleton className="h-4 w-24" />
                <Skeleton className="mt-2 h-8 w-32" />
              </div>
              <Skeleton className="h-7 w-14" />
            </div>

            <div className="mt-5 grid gap-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <article key={index} className={`${skeletonCardClass} px-4 py-4`}>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-40" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-7 w-16" />
                      <Skeleton className="h-8 w-24" />
                    </div>
                  </div>

                  <Skeleton className="mt-4 h-4 w-full" />
                  <Skeleton className="mt-2 h-4 w-5/6" />
                  <Skeleton className="mt-4 h-8 w-24" />
                </article>
              ))}
            </div>
          </section>
        </div>
      </section>
    </PageShell>
  )
}

function ArticleEngagementPanelSkeleton() {
  return (
    <section className={`${skeletonPanelClass} mx-auto w-full max-w-4xl px-6 py-6`}>
      <div className="flex flex-col gap-4 border-b border-border/60 pb-5 md:flex-row md:items-end md:justify-between">
        <div className="space-y-3">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-8 w-36" />
          <Skeleton className="h-5 w-full max-w-xl" />
        </div>

        <div className="flex flex-wrap gap-3">
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 w-28 border-primary/40 bg-primary/70 shadow-none" />
          <Skeleton className="h-10 w-28 border-[#73766f]/32 bg-[#d9d1ad]/52 shadow-none" />
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.92fr)]">
        <div className="grid gap-3">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-24" />
            </div>
            <Skeleton className="h-8 w-24" />
          </div>
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className={`${skeletonCardClass} relative isolate overflow-hidden px-5 py-5`}>
              <div className="flex items-center justify-between gap-4 border-b border-border/60 pb-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-4 w-28" />
              </div>
              <Skeleton className="mt-4 h-4 w-full" />
              <Skeleton className="mt-2 h-4 w-5/6" />
            </div>
          ))}
        </div>

        <div className={`${skeletonCardClass} relative isolate overflow-hidden px-5 py-5`}>
          <div className="space-y-2 border-b border-border/60 pb-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-28" />
            <Skeleton className="h-5 w-full" />
          </div>
          <Skeleton className="mt-5 h-40 w-full" />
          <div className="mt-4 flex items-center justify-between gap-3">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-9 w-28 border-primary/40 bg-primary/70 shadow-none" />
          </div>
        </div>
      </div>
    </section>
  )
}

function TocPanelSkeleton({ terminal = false }: { terminal?: boolean }) {
  return (
    <section className={terminal ? "terminal-panel px-5 py-5" : "article-sidecard px-5 py-5"}>
      <div className="space-y-1 border-b border-border/60 pb-4">
        <Skeleton className={terminal ? "h-4 w-20 border-none bg-primary/20 shadow-none" : "h-4 w-20"} />
        <Skeleton className={terminal ? "mt-2 h-6 w-24 border-none bg-white/10 shadow-none" : "mt-2 h-6 w-24"} />
      </div>

      <div className="mt-4 grid gap-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton
            key={index}
            className={terminal ? "h-9 w-full border-none bg-white/8 shadow-none" : index % 2 === 0 ? "h-9 w-full" : "h-9 w-5/6"}
          />
        ))}
      </div>
    </section>
  )
}

function ArticlePageSkeleton() {
  return (
    <PageShell>
      <div className="mx-auto grid w-full max-w-7xl gap-6 md:gap-8 xl:grid-cols-[minmax(0,1fr)_300px] xl:items-start">
        <article className="min-w-0">
          <div className={`${skeletonDocumentClass} mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 sm:py-8 md:px-12`}>
            <Skeleton className="h-4 w-36" />

            <header className="mt-6 border-b-4 border-foreground pb-8">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-4 w-28" />
              </div>

              <Skeleton className="mt-5 h-16 w-full max-w-3xl" />
              <Skeleton className="mt-2 h-16 w-5/6 max-w-2xl" />
              <Skeleton className="mt-5 h-5 w-full max-w-2xl" />
              <Skeleton className="mt-2 h-5 w-4/5 max-w-xl" />

              <div className="mt-6 flex flex-wrap gap-3">
                <Skeleton className="h-9 w-28 border-black/15 bg-black/80 shadow-none" />
                <Skeleton className="h-9 w-36" />
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-16" />
              </div>
            </header>

            <div className="mt-8 overflow-hidden border-[4px] border-[#73766f]/38 bg-[#c6bd99]">
              <Skeleton className="h-[14rem] w-full border-none bg-black/14 shadow-none sm:h-[18rem] md:h-[22rem]" />
            </div>

            <div className="mt-8 xl:hidden">
              <TocPanelSkeleton />
            </div>

            <div className="mt-10 grid gap-4">
              <Skeleton className="h-8 w-2/5" />
              {Array.from({ length: 10 }).map((_, index) => (
                <Skeleton
                  key={index}
                  className={index % 4 === 0 ? "h-5 w-4/5" : index % 5 === 0 ? "h-8 w-2/5" : "h-5 w-full"}
                />
              ))}
            </div>
          </div>
        </article>

        <aside className="hidden xl:grid xl:self-start">
          <TocPanelSkeleton />
        </aside>
      </div>

      <ArticleEngagementPanelSkeleton />

      <section className="grid gap-5 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="article-sidecard min-h-40 px-6 py-6">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="mt-5 h-7 w-3/4" />
            <Skeleton className="mt-4 h-5 w-full" />
            <Skeleton className="mt-2 h-5 w-5/6" />
          </div>
        ))}
      </section>
    </PageShell>
  )
}

export {
  AboutPageSkeleton,
  ArchiveDetailPageSkeleton,
  ArchiveDirectoryPageSkeleton,
  AuthPageSkeleton,
  AccountPageSkeleton,
  ArticleCardSkeleton,
  ArticleEngagementPanelSkeleton,
  ArticlePageSkeleton,
  ArticlesPageSkeleton,
  HomePageSkeleton,
  SearchPageSkeleton,
  TagsPageSkeleton,
}
