import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <section className="grid gap-6" aria-label="媒体库加载中">
      <div className="admin-surface p-4 sm:p-6">
        <Skeleton tone="accent" className="h-3 w-36" />
        <Skeleton tone="inverse" className="mt-4 h-8 w-28" />
        <Skeleton tone="soft" className="mt-3 h-4 w-full max-w-2xl" />
        <div className="mt-6 grid gap-3 lg:grid-cols-[minmax(0,1fr)_12rem_auto]">
          <Skeleton tone="inverse" className="h-10" />
          <Skeleton tone="inverse" className="h-10" />
          <Skeleton tone="accent" className="h-10 w-24" />
        </div>
      </div>
      <div className="admin-surface-muted grid gap-3 p-5">
        <Skeleton tone="soft" className="h-24" />
        <Skeleton tone="soft" className="h-4 w-72 max-w-full" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="admin-surface-muted overflow-hidden">
            <Skeleton tone="soft" className="aspect-[16/10] rounded-none border-0" />
            <div className="grid gap-3 p-4">
              <Skeleton tone="inverse" className="h-5 w-40 max-w-full" />
              <Skeleton tone="soft" className="h-4 w-28" />
              <Skeleton tone="soft" className="h-9 w-full" />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
