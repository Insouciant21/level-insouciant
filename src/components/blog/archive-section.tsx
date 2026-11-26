import Link from "@/lib/navigation"
import { ArrowRight } from "lucide-react"

import { getArchiveHref } from "@/lib/content-presentation"
import type { ArchiveItem } from "@/types/blog"

type ArchiveSectionProps = {
  title: string
  items: ArchiveItem[]
  type: "tags" | "categories"
}

const archivePanelClass = "public-summary-panel"
const archiveEntryClass =
  "public-summary-card archive-card-interactive group flex flex-col justify-between gap-4 px-5 py-4 hover:-translate-y-0.5 hover:border-foreground/28 hover:bg-[#d9d1ad]/58 hover:shadow-[inset_0_1px_0_rgba(255,252,225,0.18),0_18px_36px_-30px_rgba(0,0,0,0.4)]"

function ArchiveSection({ title, items, type }: ArchiveSectionProps) {
  return (
    <section className={`${archivePanelClass} space-y-5 px-6 py-6 sm:px-7`}>
      <header className="site-section-header">
        <div>
          <p className="utility-kicker">Sector Directory</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">
            {title}
          </h2>
        </div>
        <span className="chrome-pill">{items.length} 项</span>
      </header>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, index) => (
          <li key={item.slug}>
            <Link
              href={getArchiveHref(type, item)}
              className={archiveEntryClass}
            >
              <div className="flex items-center justify-between gap-2 font-mono text-[0.65rem] tracking-[0.18em] text-muted-foreground uppercase">
                <span>SECTOR {String(index + 1).padStart(2, "0")}</span>
                <span className="utility-charcoal-chip px-2 py-0.5 text-[0.62rem]">
                  {item.count} 份
                </span>
              </div>

              <div className="flex items-center justify-between gap-3 pt-2">
                <span className="text-lg font-semibold tracking-tight text-foreground transition-colors group-hover:text-destructive">
                  {item.name}
                </span>
                <ArrowRight
                  className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground"
                  aria-hidden="true"
                />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

export { ArchiveSection }
