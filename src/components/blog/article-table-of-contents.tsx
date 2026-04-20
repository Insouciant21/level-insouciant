import Link from "next/link"

import { cn } from "@/lib/utils"
import type { TocItem } from "@/lib/toc"

type ArticleTableOfContentsProps = {
  items: TocItem[]
  className?: string
}

function ArticleTableOfContents({ items, className }: ArticleTableOfContentsProps) {
  if (items.length === 0) {
    return null
  }

  return (
    <nav aria-label="文章目录" className={cn("dossier-paper px-5 py-5", className)}>
      <div className="space-y-1 border-b border-border/60 pb-4">
        <p className="utility-kicker">TOC</p>
        <h2 className="text-lg font-semibold tracking-tight">目录</h2>
      </div>

      <ol className="mt-4 grid gap-2">
        {items.map((item) => (
          <li key={item.id}>
            <Link
              href={`#${item.id}`}
              className={cn(
                "block border-l border-transparent px-3 py-2 text-sm leading-6 text-muted-foreground transition hover:border-foreground/30 hover:bg-muted/30 hover:text-foreground",
                item.depth === 3 ? "pl-6" : "pl-3"
              )}
            >
              {item.text}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  )
}

export { ArticleTableOfContents }
