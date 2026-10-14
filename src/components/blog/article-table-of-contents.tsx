import Link from "@/lib/navigation"

import { PerfectScrollbar } from "@/components/ui/perfect-scrollbar"
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

  const floating = variant === "desktop-floating"
  const indexLinks = (
    <ol className={cn("grid gap-2", floating ? "px-5 pb-5" : "mt-4")}>
      {items.map((item) => (
        <li key={item.id}>
          <Link
            href={`#${item.id}`}
            className={cn(tocLinkClass, item.depth === 3 ? "pl-6" : "pl-3")}
          >
            {item.text}
          </Link>
        </li>
      ))}
    </ol>
  )

  const indexCard = (
    <nav
      aria-label="文章目录"
      className={cn(
        "article-sidecard",
        floating
          ? "flex max-h-[calc(100svh-9rem)] min-h-0 flex-col"
          : "px-5 py-5",
        className
      )}
    >
      <div
        className={cn(
          "shrink-0 space-y-1 border-b border-[#73766f]/40 pb-4",
          floating && "mx-5 mt-5"
        )}
      >
        <p className="utility-kicker">Known Index</p>
        <h2 className="text-lg font-semibold tracking-tight">目录</h2>
      </div>
      {floating ? (
        <PerfectScrollbar
          role="region"
          aria-label="文章目录滚动区域"
          tabIndex={0}
          className="mt-4 min-h-0 overflow-y-auto overscroll-contain focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          {indexLinks}
        </PerfectScrollbar>
      ) : (
        indexLinks
      )}
    </nav>
  )

  if (floating) {
    return (
      <aside className="hidden xl:sticky xl:top-32 xl:block xl:self-start">
        {indexCard}
      </aside>
    )
  }

  return indexCard
}

export { ArticleTableOfContents }
