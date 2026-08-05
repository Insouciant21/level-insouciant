import Link from "next/link"

import { cn } from "@/lib/utils"
import type { TocItem } from "@/lib/toc"

type ArticleTableOfContentsProps = {
  items: TocItem[]
  className?: string
  variant?: "inline" | "desktop-floating"
}

const tocLinkClass =
  "block rounded-sm border-l border-transparent px-3 py-2 text-sm leading-6 text-muted-foreground transition duration-500 hover:border-[#73766f]/42 hover:bg-[#d9d1ad]/42 hover:text-foreground"

function ArticleTableOfContents({
  items,
  className,
  variant = "inline",
}: ArticleTableOfContentsProps) {
  if (items.length === 0) {
    return null
  }

  const indexCard = (
    <nav aria-label="文章目录" className={cn("article-sidecard px-5 py-5", className)}>
      <div className="space-y-1 border-b border-[#73766f]/40 pb-4">
        <p className="utility-kicker">Known Index</p>
        <h2 className="text-lg font-semibold tracking-tight">目录</h2>
      </div>

      <ol className="mt-4 grid gap-2">
        {items.map((item) => (
          <li key={item.id}>
            <Link
              href={`#${item.id}`}
              className={cn(
                tocLinkClass,
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

  if (variant === "desktop-floating") {
    return (
      <aside className="hidden xl:block">
        <div
          className="fixed top-32 z-30 w-[320px]"
          style={{ right: "max(2rem, calc((100vw - 1200px) / 2))" }}
        >
          {indexCard}
        </div>
      </aside>
    )
  }

  return indexCard
}

export { ArticleTableOfContents }
