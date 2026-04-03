import Link from "next/link"

import { getArchiveHref } from "@/lib/content"
import type { ArchiveItem } from "@/types/blog"

type ArchiveSectionProps = {
  title: string
  items: ArchiveItem[]
  type: "tags" | "categories"
}

function ArchiveSection({ title, items, type }: ArchiveSectionProps) {
  return (
    <section className="surface-panel space-y-5 px-6 py-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        <span className="text-sm text-muted-foreground">{items.length} 项</span>
      </div>
      <ul className="grid gap-3">
        {items.map((item) => (
          <li key={item.slug}>
            <Link
              href={getArchiveHref(type, item)}
              className="flex items-center justify-between rounded-2xl border border-transparent bg-muted/40 px-4 py-3 transition hover:border-border hover:bg-muted"
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
