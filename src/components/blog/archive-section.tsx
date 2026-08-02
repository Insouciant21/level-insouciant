import Link from "next/link"

import { getArchiveHref } from "@/lib/content"
import type { ArchiveItem } from "@/types/blog"

type ArchiveSectionProps = {
  title: string
  items: ArchiveItem[]
  type: "tags" | "categories"
}

const archivePanelClass =
  "public-summary-panel"
const archiveEntryClass =
  "public-summary-card flex items-center justify-between px-4 py-3.5 transition duration-700 hover:-translate-y-0.5 hover:border-foreground/20 hover:bg-[#d9d1ad]/50 hover:shadow-[inset_0_1px_0_rgba(255,252,225,0.18),0_20px_42px_-34px_rgba(0,0,0,0.42)]"

function ArchiveSection({ title, items, type }: ArchiveSectionProps) {
  return (
    <section className={`${archivePanelClass} space-y-5 px-6 py-6 sm:px-7`}>
      <header className="site-section-header">
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        <span className="chrome-pill">{items.length} 项</span>
      </header>
      <ul className="grid gap-3">
        {items.map((item) => (
          <li key={item.slug}>
            <Link
              href={getArchiveHref(type, item)}
              className={archiveEntryClass}
            >
              <span>{item.name}</span>
              <span className="text-sm text-muted-foreground">{item.count}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

export { ArchiveSection }
