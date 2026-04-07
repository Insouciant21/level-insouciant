import { PageShell } from "@/components/blog/page-shell"
import { Skeleton } from "@/components/ui/skeleton"

function ArticleCardSkeleton() {
  return (
    <article className="surface-panel space-y-4 px-6 py-6">
      <div className="space-y-3">
        <Skeleton className="h-6 w-24 rounded-full" />
        <div className="space-y-3">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-5/6" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-8 w-20 rounded-full" />
        <Skeleton className="h-8 w-24 rounded-full" />
        <Skeleton className="h-8 w-18 rounded-full" />
      </div>
    </article>
  )
}

function PageIntroSkeleton() {
  return (
    <section className="space-y-4">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-10 w-40" />
      <Skeleton className="h-5 w-full max-w-2xl" />
      <Skeleton className="h-5 w-5/6 max-w-xl" />
    </section>
  )
}

function HomeHeroSkeleton() {
  return (
    <section className="surface-panel surface-grid overflow-hidden px-6 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(300px,0.8fr)] lg:items-end">
        <div className="space-y-6">
          <div className="space-y-4">
            <Skeleton className="h-4 w-28" />
            <div className="space-y-4">
              <Skeleton className="h-14 w-full max-w-3xl" />
              <Skeleton className="h-14 w-4/5 max-w-2xl" />
              <Skeleton className="h-6 w-full max-w-2xl" />
              <Skeleton className="h-6 w-5/6 max-w-xl" />
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Skeleton className="h-12 w-32 rounded-full" />
            <Skeleton className="h-12 w-28 rounded-full" />
          </div>
        </div>

        <div className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="rounded-[1.75rem] border border-border/70 bg-background/70 px-5 py-5 backdrop-blur-sm"
              >
                <Skeleton className="h-4 w-16" />
                <Skeleton className="mt-3 h-8 w-14" />
              </div>
            ))}
          </div>
          <div className="rounded-[1.75rem] border border-border/70 bg-primary/8 px-5 py-5">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="mt-2 h-5 w-4/5" />
          </div>
        </div>
      </div>
    </section>
  )
}

function HomeAsideSkeleton() {
  return (
    <aside className="grid gap-6 sm:grid-cols-2 xl:grid-cols-1">
      {Array.from({ length: 3 }).map((_, index) => (
        <section key={index} className="surface-panel px-6 py-6">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="mt-2 h-7 w-28" />
          <div className="mt-6 grid gap-3">
            {Array.from({ length: index === 1 ? 4 : 5 }).map((__, lineIndex) => (
              <Skeleton
                key={lineIndex}
                className={index === 0 ? "h-9 w-24 rounded-full" : "h-5 w-full"}
              />
            ))}
          </div>
        </section>
      ))}
    </aside>
  )
}

function HomePageSkeleton() {
  return (
    <PageShell className="gap-8">
      <HomeHeroSkeleton />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.28fr)_minmax(320px,0.72fr)]">
        <section className="grid gap-5">
          <div className="surface-panel px-6 py-6 sm:px-7">
            <div className="flex flex-col gap-4 border-b border-border/60 pb-5 sm:flex-row sm:items-end sm:justify-between">
              <div className="space-y-3">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-5 w-80 max-w-full" />
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-9 w-24 rounded-full" />
              </div>
            </div>

            <div className="mt-6 grid gap-5">
              {Array.from({ length: 3 }).map((_, index) => (
                <ArticleCardSkeleton key={index} />
              ))}
            </div>
          </div>
        </section>

        <HomeAsideSkeleton />
      </div>
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

function SearchPageSkeleton() {
  return (
    <PageShell>
      <PageIntroSkeleton />
      <section className="surface-panel px-6 py-6">
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto]">
          <div className="grid gap-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-12 w-full rounded-[1.5rem]" />
          </div>
          <div className="flex items-end gap-3">
            <Skeleton className="h-10 w-24 rounded-full" />
          </div>
        </div>
        <div className="mt-5 flex gap-3">
          <Skeleton className="h-4 w-44" />
          <Skeleton className="h-4 w-40" />
        </div>
      </section>
      <section className="grid gap-5">
        {Array.from({ length: 4 }).map((_, index) => (
          <ArticleCardSkeleton key={index} />
        ))}
      </section>
    </PageShell>
  )
}

function ArticleEngagementPanelSkeleton() {
  return (
    <section className="surface-panel mx-auto w-full max-w-4xl px-6 py-6">
      <div className="flex flex-col gap-4 border-b border-border/60 pb-5 md:flex-row md:items-end md:justify-between">
        <div className="space-y-3">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-5 w-96 max-w-full" />
        </div>
        <div className="flex flex-wrap gap-3">
          <Skeleton className="h-10 w-28 rounded-full" />
          <Skeleton className="h-10 w-28 rounded-full" />
          <Skeleton className="h-10 w-28 rounded-full" />
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.92fr)]">
        <div className="grid gap-3">
          <Skeleton className="h-6 w-28" />
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="rounded-2xl bg-muted/35 px-4 py-4">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="mt-3 h-4 w-full" />
              <Skeleton className="mt-2 h-4 w-5/6" />
            </div>
          ))}
        </div>

        <div className="rounded-[1.75rem] border border-border/70 bg-background/45 px-5 py-5">
          <Skeleton className="h-6 w-28" />
          <Skeleton className="mt-3 h-5 w-full" />
          <Skeleton className="mt-5 h-40 w-full rounded-[1.5rem]" />
          <Skeleton className="mt-4 h-10 w-28 rounded-full" />
        </div>
      </div>
    </section>
  )
}

function ArticlePageSkeleton() {
  return (
    <PageShell>
      <div className="mx-auto grid w-full max-w-6xl gap-8 xl:grid-cols-[minmax(0,1fr)_260px] xl:items-start">
        <article className="min-w-0">
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 xl:mx-0 xl:max-w-none">
            <Skeleton className="h-4 w-28" />
            <header className="space-y-5 border-b border-border/60 pb-8">
              <Skeleton className="h-6 w-24 rounded-full" />
              <div className="space-y-3">
                <Skeleton className="h-14 w-full max-w-3xl" />
                <Skeleton className="h-14 w-4/5 max-w-2xl" />
                <Skeleton className="h-5 w-full max-w-2xl" />
              </div>
              <div className="flex gap-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
              </div>
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-8 w-20 rounded-full" />
                <Skeleton className="h-8 w-24 rounded-full" />
                <Skeleton className="h-8 w-16 rounded-full" />
              </div>
            </header>

            <div className="xl:hidden">
              <section className="surface-panel px-5 py-5">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="mt-2 h-6 w-20" />
                <div className="mt-4 grid gap-2">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Skeleton key={index} className="h-9 w-full rounded-xl" />
                  ))}
                </div>
              </section>
            </div>

            <div className="grid gap-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <Skeleton
                  key={index}
                  className={index % 3 === 0 ? "h-8 w-2/5" : "h-5 w-full"}
                />
              ))}
            </div>
          </div>
        </article>

        <aside className="hidden xl:block">
          <section className="surface-panel px-5 py-5">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="mt-2 h-6 w-20" />
            <div className="mt-4 grid gap-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-9 w-full rounded-xl" />
              ))}
            </div>
          </section>
        </aside>
      </div>

      <ArticleEngagementPanelSkeleton />

      <section className="grid gap-5 md:grid-cols-2">
        <div className="surface-panel min-h-40 px-6 py-6">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="mt-5 h-7 w-3/4" />
          <Skeleton className="mt-4 h-5 w-full" />
        </div>
        <div className="surface-panel min-h-40 px-6 py-6">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="mt-5 h-7 w-3/4" />
          <Skeleton className="mt-4 h-5 w-full" />
        </div>
      </section>
    </PageShell>
  )
}

function AdminPageSkeleton() {
  return (
    <section className="surface-panel px-6 py-6">
      <div className="space-y-3 border-b border-border/60 pb-5">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-5 w-full max-w-2xl" />
      </div>
      <div className="mt-6 grid gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-[1.75rem] border border-border/70 bg-background/50 px-5 py-5">
            <Skeleton className="h-7 w-1/3" />
            <Skeleton className="mt-4 h-5 w-full" />
            <Skeleton className="mt-2 h-5 w-4/5" />
          </div>
        ))}
      </div>
    </section>
  )
}

export {
  AdminPageSkeleton,
  ArticleCardSkeleton,
  ArticleEngagementPanelSkeleton,
  ArticlePageSkeleton,
  ArticlesPageSkeleton,
  HomePageSkeleton,
  SearchPageSkeleton,
}
