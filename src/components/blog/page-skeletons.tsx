import { PageShell } from "@/components/blog/page-shell"
import { PageIntro } from "@/components/blog/page-intro"
import { Skeleton } from "@/components/ui/skeleton"

const skeletonPanelClass = "public-summary-panel"
const skeletonDocumentClass = "public-summary-panel-document"
const skeletonCardClass = "public-summary-card"
const skeletonSoftCardClass = "public-summary-card-muted"

function DoorCardSkeleton({ featured = false }: { featured?: boolean }) {
  return (
    <article
      className={[
        "door-card relative flex min-w-0 flex-col overflow-hidden rounded-md border",
        featured
          ? "min-h-[16rem] border-foreground/20 sm:min-h-[18rem] lg:col-span-2 lg:row-span-2 lg:min-h-[24rem]"
          : "min-h-[16rem] border-foreground/15 sm:min-h-[18rem]",
      ].join(" ")}
    >
      <div className="door-card__shade absolute inset-0" />

      <div className="relative z-10 flex h-full min-w-0 flex-col gap-3 px-4 py-4 sm:px-5 sm:py-5">
        <div className="flex min-w-0 flex-wrap items-start justify-between gap-3 sm:gap-4">
          <Skeleton tone="accent" className="h-5 w-16" />
          <span className="facility-signage-chip border px-2.5 py-1 text-[0.56rem] font-semibold tracking-[0.28em] uppercase shadow-sm sm:text-[0.6rem] sm:tracking-[0.3em]">
            Archive
          </span>
        </div>

        <div className="mt-auto min-w-0">
          <div className="door-card__panel min-w-0 border px-4 py-4 backdrop-blur-sm">
            <Skeleton tone="soft" className="h-3 w-32 max-w-full" />
            <Skeleton tone="neutral" className="mt-4 h-10 w-full max-w-lg" />
            <Skeleton tone="neutral" className="mt-2 h-10 w-4/5 max-w-md" />

            <div className="mt-5 flex min-w-0 flex-wrap items-center gap-3 border-t border-black/10 pt-4">
              <Skeleton tone="soft" className="h-3 w-28" />
              <Skeleton tone="soft" className="h-3 w-24" />
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

function PageIntroSkeleton({ action = false }: { action?: boolean } = {}) {
  return (
    <section className="site-section-header max-w-5xl min-w-0 items-start">
      <div className="min-w-0 space-y-3">
        <Skeleton tone="accent" className="h-4 w-28" />
        <Skeleton tone="neutral" className="h-10 w-72 max-w-full" />
        <Skeleton tone="soft" className="h-5 w-full max-w-3xl" />
        <Skeleton tone="soft" className="h-5 w-5/6 max-w-2xl" />
      </div>
      {action ? <Skeleton tone="accent" className="h-8 w-24 shrink-0" /> : null}
    </section>
  )
}

function ArticlesPageSkeleton() {
  return (
    <PageShell>
      <PageIntro
        eyebrow="Archive"
        title="层级档案"
      />
      <section className="grid min-w-0 gap-5">
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
      <PageIntro
        eyebrow="Categories"
        title="分类归档"
      />
      <section
        className={`${skeletonPanelClass} min-w-0 space-y-5 px-6 py-6 sm:px-7`}
      >
        <header className="site-section-header">
          <Skeleton tone="neutral" className="h-8 w-32 max-w-full" />
          <Skeleton tone="soft" className="h-8 w-20 shrink-0" />
        </header>

        <div className="grid gap-3">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className={`${skeletonCardClass} flex min-w-0 items-center justify-between gap-4 px-4 py-3.5`}
            >
              <Skeleton tone="neutral" className="h-5 w-40 max-w-full" />
              <Skeleton tone="soft" className="h-4 w-10 shrink-0" />
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
      <PageIntroSkeleton action />
      <section className="grid min-w-0 gap-5">
        {Array.from({ length: 4 }).map((_, index) => (
          <ArticleCardSkeleton key={index} />
        ))}
      </section>
    </PageShell>
  )
}

function TagAggregateBlockSkeleton() {
  return (
    <section className={`${skeletonPanelClass} min-w-0 px-6 py-6 sm:px-7`}>
      <header className="site-section-header">
        <div className="min-w-0">
          <Skeleton tone="accent" className="h-4 w-16" />
          <Skeleton tone="neutral" className="mt-2 h-10 w-40 max-w-full" />
          <Skeleton tone="soft" className="mt-2 h-5 w-full max-w-sm" />
        </div>
        <Skeleton tone="soft" className="h-4 w-28 shrink-0" />
      </header>

      <div className="mt-6 grid gap-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className={`${skeletonCardClass} min-w-0 px-4 py-4`}>
            <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 space-y-2">
                <Skeleton tone="neutral" className="h-7 w-2/3 max-w-xl" />
                <Skeleton tone="soft" className="h-4 w-full max-w-2xl" />
                <Skeleton tone="soft" className="h-4 w-5/6 max-w-xl" />
              </div>
              <Skeleton tone="soft" className="h-4 w-24 shrink-0" />
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
      <PageIntro
        eyebrow="Tags"
        title="标签归档"
      />

      <div className="grid min-w-0 gap-6">
        <section className={`${skeletonPanelClass} min-w-0 px-6 py-6`}>
          <header className="site-section-header">
            <div>
              <Skeleton tone="accent" className="h-4 w-20" />
              <Skeleton tone="neutral" className="mt-2 h-8 w-32" />
            </div>
            <Skeleton tone="soft" className="h-4 w-24 shrink-0" />
          </header>

          <div className="mt-6 flex min-w-0 flex-wrap gap-3">
            {Array.from({ length: 8 }).map((_, index) => (
              <Skeleton
                key={index}
                tone="soft"
                className={
                  index % 3 === 0
                    ? "h-10 w-28"
                    : index % 3 === 1
                      ? "h-10 w-24"
                      : "h-10 w-20"
                }
              />
            ))}
          </div>
        </section>

        <div className="grid min-w-0 gap-6">
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
      <section className="mx-auto w-full max-w-[800px] min-w-0 px-5 py-12 sm:px-6 sm:py-20">
        <div className="terminal-panel relative min-w-0 overflow-hidden border-[3px] px-5 py-6 sm:px-8 sm:py-8 md:px-12 md:py-12">
          <header className="relative z-10 flex min-w-0 items-center justify-between gap-4 border-b-2 border-primary/20 pb-4">
            <div className="flex min-w-0 items-center gap-4">
              <Skeleton tone="accent" className="size-5 shrink-0" />
              <Skeleton tone="inverse" className="h-4 w-44 max-w-full" />
            </div>
            <Skeleton tone="inverse" className="size-5 shrink-0" />
          </header>

          <div className="relative z-10 mt-10 grid min-w-0 gap-6 sm:mt-12">
            <Skeleton tone="inverse" className="h-4 w-60 max-w-full" />

            <div className="flex min-w-0 items-center gap-4 border-l-4 border-primary bg-[#12140f] px-4 py-4">
              <Skeleton tone="accent" className="size-6 shrink-0" />
              <Skeleton tone="inverse" className="h-12 w-full min-w-0" />
            </div>

            <Skeleton
              tone="accent"
              className="h-12 w-full max-w-full sm:ml-auto sm:w-44"
            />
          </div>

          <div className="relative z-10 mt-10 min-w-0 space-y-4 sm:mt-12">
            <Skeleton tone="inverse" className="h-4 w-48 max-w-full" />
            <Skeleton tone="inverse" className="h-4 w-44 max-w-full" />
            <div className="pt-4">
              <Skeleton tone="inverse" className="h-px w-full" />
            </div>

            <div className="grid min-w-0 gap-4 pt-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="flex min-w-0 items-center gap-4 border border-primary/10 p-4"
                >
                  <Skeleton tone="accent" className="h-4 w-8 shrink-0" />
                  <Skeleton tone="inverse" className="h-4 w-full min-w-0" />
                  <Skeleton tone="inverse" className="h-4 w-8 shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  )
}

function AuthPageSkeleton() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 items-center px-5 py-16 sm:px-6 lg:px-8">
      <section
        className={`${skeletonDocumentClass} grid w-full min-w-0 gap-8 px-6 py-8 sm:px-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]`}
      >
        <div className="min-w-0 space-y-4">
          <Skeleton tone="accent" className="h-4 w-24" />
          <Skeleton tone="neutral" className="h-14 w-full max-w-xl" />
          <Skeleton tone="neutral" className="h-14 w-4/5 max-w-lg" />
          <Skeleton tone="soft" className="h-5 w-full max-w-xl" />
          <Skeleton tone="soft" className="h-5 w-5/6 max-w-lg" />
          <div
            className={`${skeletonSoftCardClass} min-w-0 border-dashed px-5 py-5`}
          >
            <Skeleton tone="accent" className="h-4 w-24" />
            <Skeleton tone="soft" className="mt-3 h-4 w-full max-w-xl" />
            <Skeleton tone="soft" className="mt-2 h-4 w-5/6 max-w-lg" />
          </div>
        </div>

        <div className="grid min-w-0 gap-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="grid min-w-0 gap-2">
              <Skeleton tone="soft" className="h-4 w-16" />
              <Skeleton tone="neutral" className="h-12 w-full min-w-0" />
            </div>
          ))}
          <Skeleton tone="accent" className="h-10 w-full" />
          <Skeleton tone="soft" className="h-px w-full" />
          <Skeleton tone="soft" className="h-4 w-40 max-w-full" />
        </div>
      </section>
    </main>
  )
}

function AccountPageSkeleton() {
  return (
    <PageShell>
      <section className={`${skeletonDocumentClass} min-w-0 px-6 py-6 sm:px-7`}>
        <div className="flex min-w-0 flex-col gap-4 border-b border-border/60 pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <Skeleton tone="accent" className="h-4 w-28" />
            <Skeleton tone="neutral" className="mt-2 h-10 w-40 max-w-full" />
          </div>
        </div>

        <Skeleton tone="soft" className="mt-5 h-4 w-40 max-w-full" />

        <div className="mt-6 grid min-w-0 gap-6 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
          <div className="grid min-w-0 gap-6">
            <section className={`${skeletonSoftCardClass} min-w-0 px-5 py-5`}>
              <div className="flex min-w-0 items-start gap-4">
                <Skeleton tone="neutral" className="size-16 shrink-0" />
                <div className="min-w-0 space-y-2">
                  <Skeleton tone="neutral" className="h-6 w-28 max-w-full" />
                  <Skeleton tone="soft" className="h-4 w-40 max-w-full" />
                  <Skeleton tone="soft" className="h-4 w-28 max-w-full" />
                </div>
              </div>
            </section>

            {Array.from({ length: 2 }).map((_, index) => (
              <section
                key={index}
                className={`${skeletonSoftCardClass} min-w-0 px-5 py-5`}
              >
                <div className="mb-5">
                  <Skeleton tone="accent" className="h-4 w-20" />
                  <Skeleton
                    tone="neutral"
                    className="mt-2 h-8 w-32 max-w-full"
                  />
                </div>

                <div className="grid min-w-0 gap-4">
                  {Array.from({ length: 3 }).map((_, fieldIndex) => (
                    <div key={fieldIndex} className="grid min-w-0 gap-2">
                      <Skeleton tone="soft" className="h-4 w-16" />
                      <Skeleton
                        tone="neutral"
                        className="h-12 w-full min-w-0"
                      />
                    </div>
                  ))}
                  <Skeleton
                    tone="accent"
                    className="mt-2 h-10 w-full sm:w-28"
                  />
                </div>
              </section>
            ))}
          </div>

          <section className={`${skeletonSoftCardClass} min-w-0 px-5 py-5`}>
            <div className="flex min-w-0 items-center justify-between gap-4">
              <div className="min-w-0">
                <Skeleton tone="accent" className="h-4 w-24" />
                <Skeleton tone="neutral" className="mt-2 h-8 w-32 max-w-full" />
              </div>
              <Skeleton tone="soft" className="h-7 w-14 shrink-0" />
            </div>

            <div className="mt-5 grid min-w-0 gap-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <article
                  key={index}
                  className={`${skeletonCardClass} min-w-0 px-4 py-4`}
                >
                  <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 space-y-2">
                      <Skeleton
                        tone="neutral"
                        className="h-5 w-40 max-w-full"
                      />
                      <Skeleton tone="soft" className="h-4 w-32 max-w-full" />
                    </div>
                    <div className="flex min-w-0 flex-wrap items-center gap-3">
                      <Skeleton tone="soft" className="h-7 w-16" />
                      <Skeleton tone="accent" className="h-8 w-24" />
                    </div>
                  </div>

                  <Skeleton tone="soft" className="mt-4 h-4 w-full max-w-2xl" />
                  <Skeleton tone="soft" className="mt-2 h-4 w-5/6 max-w-xl" />
                  <Skeleton tone="accent" className="mt-4 h-8 w-24" />
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
    <section
      className={`${skeletonPanelClass} mx-auto w-full max-w-4xl min-w-0 px-6 py-6`}
    >
      <div className="flex min-w-0 flex-col gap-4 border-b border-border/60 pb-5 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0 space-y-3">
          <Skeleton tone="accent" className="h-4 w-28" />
          <Skeleton tone="neutral" className="h-8 w-36 max-w-full" />
          <Skeleton tone="soft" className="h-5 w-full max-w-xl" />
        </div>

        <div className="flex min-w-0 flex-wrap gap-3">
          <Skeleton tone="soft" className="h-10 w-28" />
          <Skeleton tone="accent" className="h-10 w-28" />
          <Skeleton tone="soft" className="h-10 w-28" />
        </div>
      </div>

      <div className="mt-6 grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.92fr)]">
        <div className="grid min-w-0 gap-3">
          <div className="flex min-w-0 items-center justify-between gap-4">
            <div className="space-y-2">
              <Skeleton tone="soft" className="h-4 w-24" />
              <Skeleton tone="neutral" className="h-6 w-24" />
            </div>
            <Skeleton tone="soft" className="h-8 w-24 shrink-0" />
          </div>
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className={`${skeletonCardClass} min-w-0 px-5 py-5`}
            >
              <div className="flex min-w-0 items-center justify-between gap-4 border-b border-border/60 pb-4">
                <div className="min-w-0 space-y-2">
                  <Skeleton tone="neutral" className="h-4 w-24 max-w-full" />
                  <Skeleton tone="soft" className="h-3 w-20" />
                </div>
                <Skeleton tone="soft" className="h-4 w-28 shrink-0" />
              </div>
              <Skeleton tone="soft" className="mt-4 h-4 w-full max-w-2xl" />
              <Skeleton tone="soft" className="mt-2 h-4 w-5/6 max-w-xl" />
            </div>
          ))}
        </div>

        <div className={`${skeletonCardClass} min-w-0 px-5 py-5`}>
          <div className="min-w-0 space-y-2 border-b border-border/60 pb-4">
            <Skeleton tone="accent" className="h-4 w-24" />
            <Skeleton tone="neutral" className="h-6 w-28" />
            <Skeleton tone="soft" className="h-5 w-full max-w-xl" />
          </div>
          <Skeleton tone="soft" className="mt-5 h-40 w-full" />
          <div className="mt-4 flex min-w-0 items-center justify-between gap-3">
            <Skeleton tone="soft" className="h-8 w-20" />
            <Skeleton tone="accent" className="h-9 w-28" />
          </div>
        </div>
      </div>
    </section>
  )
}

function TocPanelSkeleton({ terminal = false }: { terminal?: boolean }) {
  return (
    <section
      className={
        terminal
          ? "terminal-panel min-w-0 px-5 py-5"
          : "article-sidecard min-w-0 px-5 py-5"
      }
    >
      <div className="min-w-0 space-y-1 border-b border-border/60 pb-4">
        <Skeleton tone={terminal ? "accent" : "soft"} className="h-4 w-20" />
        <Skeleton
          tone={terminal ? "inverse" : "neutral"}
          className="mt-2 h-6 w-24"
        />
      </div>

      <div className="mt-4 grid min-w-0 gap-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton
            key={index}
            tone={terminal ? "inverse" : "soft"}
            className={index % 2 === 0 ? "h-9 w-full" : "h-9 w-5/6 max-w-full"}
          />
        ))}
      </div>
    </section>
  )
}

function ArticlePageSkeleton() {
  return (
    <PageShell>
      <div
        data-skeleton-layout="article"
        className="mx-auto grid w-full max-w-[1200px] min-w-0 gap-8 md:gap-12 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start"
      >
        <article className="min-w-0">
          <div
            className={`${skeletonDocumentClass} mx-auto w-full max-w-4xl min-w-0 px-4 py-6 sm:px-8 sm:py-8 md:px-16 md:py-12`}
          >
            <Skeleton tone="accent" className="h-4 w-36 max-w-full" />

            <header className="mt-6 min-w-0 border-b-4 border-foreground pb-8">
              <div className="flex min-w-0 flex-wrap items-center justify-between gap-4">
                <Skeleton tone="soft" className="h-4 w-36 max-w-full" />
                <Skeleton tone="soft" className="h-4 w-28 shrink-0" />
              </div>

              <div className="mt-5 max-w-3xl min-w-0 space-y-2">
                <Skeleton
                  tone="neutral"
                  className="h-16 w-full max-w-3xl min-w-0"
                />
                <Skeleton
                  tone="neutral"
                  className="h-16 w-5/6 max-w-2xl min-w-0"
                />
              </div>
              <Skeleton
                tone="soft"
                className="mt-5 h-5 w-full max-w-2xl min-w-0"
              />
              <Skeleton
                tone="soft"
                className="mt-2 h-5 w-4/5 max-w-xl min-w-0"
              />

              <div className="mt-6 flex min-w-0 flex-wrap gap-3">
                <Skeleton tone="accent" className="h-9 w-28" />
                <Skeleton tone="soft" className="h-9 w-36" />
              </div>

              <div className="mt-6 flex min-w-0 flex-wrap gap-2">
                <Skeleton tone="soft" className="h-8 w-20" />
                <Skeleton tone="soft" className="h-8 w-24" />
                <Skeleton tone="soft" className="h-8 w-16" />
              </div>
            </header>

            <div className="mt-8 aspect-[1600/880] min-w-0 overflow-hidden border-[4px] border-foreground/20 bg-[#c6bd99]">
              <Skeleton tone="soft" className="h-full w-full border-0" />
            </div>

            <div className="mt-8 xl:hidden">
              <TocPanelSkeleton />
            </div>

            <div className="mt-10 grid min-w-0 gap-4">
              <Skeleton tone="neutral" className="h-8 w-2/5 max-w-2xl" />
              {Array.from({ length: 10 }).map((_, index) => (
                <Skeleton
                  key={index}
                  tone="soft"
                  className={
                    index % 4 === 0
                      ? "h-5 w-4/5 max-w-3xl min-w-0"
                      : index % 5 === 0
                        ? "h-8 w-2/5 max-w-2xl min-w-0"
                        : "h-5 w-full max-w-3xl min-w-0"
                  }
                />
              ))}
            </div>
          </div>
        </article>

        <aside className="hidden min-w-0 xl:grid xl:self-start">
          <TocPanelSkeleton />
        </aside>
      </div>

      <ArticleEngagementPanelSkeleton />

      <section className="grid min-w-0 gap-5 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <div
            key={index}
            className="article-sidecard min-h-40 min-w-0 px-6 py-6"
          >
            <Skeleton tone="accent" className="h-4 w-20" />
            <Skeleton tone="neutral" className="mt-5 h-7 w-3/4 max-w-xl" />
            <Skeleton tone="soft" className="mt-4 h-5 w-full max-w-2xl" />
            <Skeleton tone="soft" className="mt-2 h-5 w-5/6 max-w-xl" />
          </div>
        ))}
      </section>
    </PageShell>
  )
}

export {
  ArchiveDetailPageSkeleton,
  ArchiveDirectoryPageSkeleton,
  AuthPageSkeleton,
  AccountPageSkeleton,
  ArticleCardSkeleton,
  ArticleEngagementPanelSkeleton,
  ArticlePageSkeleton,
  ArticlesPageSkeleton,
  SearchPageSkeleton,
  TagsPageSkeleton,
}
