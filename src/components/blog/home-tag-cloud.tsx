import Link from "next/link"

import { getArchiveHref } from "@/lib/content"
import { cn } from "@/lib/utils"
import type { ArchiveItem } from "@/types/blog"

type HomeTagCloudProps = {
  items: ArchiveItem[]
}

const densityClasses = [
  "text-xs",
  "text-sm",
  "text-base",
  "text-lg",
] as const

function getDensityClass(count: number, min: number, max: number) {
  if (min === max) {
    return densityClasses[1]
  }

  const normalized = (count - min) / (max - min)
  const index = Math.min(densityClasses.length - 1, Math.floor(normalized * densityClasses.length))

  return densityClasses[index]
}

function HomeTagCloud({ items }: HomeTagCloudProps) {
  if (items.length === 0) {
    return null
  }

  const visibleItems = items.slice(0, 14)
  const counts = visibleItems.map((item) => item.count)
  const min = Math.min(...counts)
  const max = Math.max(...counts)

  return (
    <section className="surface-panel px-6 py-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Tag Cloud</p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight">标签云</h2>
        </div>
        <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
          {items.length} 项
        </span>
      </div>

      <div className="flex flex-wrap gap-3">
        {visibleItems.map((item) => (
          <Link
            key={item.slug}
            href={getArchiveHref("tags", item)}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border border-border/70 bg-muted/35 px-4 py-2 font-medium text-foreground transition hover:-translate-y-0.5 hover:border-primary/50 hover:bg-primary/10",
              getDensityClass(item.count, min, max)
            )}
          >
            <span>{item.name}</span>
            <span className="text-xs text-muted-foreground">{item.count}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}

export { HomeTagCloud }
