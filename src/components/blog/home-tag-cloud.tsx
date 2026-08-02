import Link from "next/link"

import { getArchiveHref } from "@/lib/content"
import { cn } from "@/lib/utils"
import type { ArchiveItem } from "@/types/blog"

type HomeTagCloudProps = {
  items: ArchiveItem[]
}

const tagCloudPanelClass = "public-summary-panel px-6 py-6 sm:px-7"
const tagCloudChipClass =
  "public-summary-card-muted inline-flex items-center gap-2 px-4 py-2 font-medium text-foreground transition duration-500 hover:-translate-y-0.5 hover:border-foreground/20 hover:bg-[#d9d1ad]/46"

const densityClasses = ["text-xs", "text-sm", "text-base", "text-lg"] as const

function getDensityClass(count: number, min: number, max: number) {
  if (min === max) {
    return densityClasses[1]
  }

  const normalized = (count - min) / (max - min)
  const index = Math.min(
    densityClasses.length - 1,
    Math.floor(normalized * densityClasses.length)
  )

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
    <section className={tagCloudPanelClass}>
      <header className="site-section-header mb-5">
        <div>
          <p className="utility-kicker">Index</p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">
            关键词索引
          </h2>
        </div>
        <span className="chrome-pill">{items.length} 项</span>
      </header>

      <div className="flex flex-wrap gap-3">
        {visibleItems.map((item) => (
          <Link
            key={item.slug}
            href={getArchiveHref("tags", item)}
            className={cn(
              tagCloudChipClass,
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
