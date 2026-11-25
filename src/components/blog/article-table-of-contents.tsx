import * as React from "react"
import { ArrowUp, ChevronDown, MessageSquare } from "lucide-react"
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
  "toc-link block rounded-[2px] border-l-2 border-transparent px-3 py-1.5 text-sm leading-6 text-muted-foreground transition duration-200 hover:border-[#73766f]/55 hover:bg-[#d9d1ad]/52 hover:text-foreground"

function ArticleTableOfContents({
  items,
  className,
  variant = "inline",
}: ArticleTableOfContentsProps) {
  const [activeId, setActiveId] = React.useState<string | null>(
    items[0]?.id ?? null
  )
  const [mobileExpanded, setMobileExpanded] = React.useState(items.length <= 4)

  React.useEffect(() => {
    if (
      variant !== "desktop-floating" ||
      items.length === 0 ||
      typeof IntersectionObserver === "undefined"
    ) {
      return
    }

    const headingElements = items
      .map((item) => document.getElementById(item.id))
      .filter((element): element is HTMLElement => element !== null)

    if (headingElements.length === 0) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)

        if (visible[0]?.target.id) {
          setActiveId(visible[0].target.id)
        }
      },
      {
        rootMargin: "-96px 0px -65% 0px",
        threshold: [0, 1],
      }
    )

    headingElements.forEach((element) => observer.observe(element))
    return () => observer.disconnect()
  }, [items, variant])

  if (items.length === 0) {
    return null
  }

  const floating = variant === "desktop-floating"
  const indexLinks = (
    <ol className={cn("grid gap-1.5", floating ? "px-5 pb-4" : "mt-4")}>
      {items.map((item) => (
        <li key={item.id}>
          <Link
            href={`#${item.id}`}
            data-active={floating && activeId === item.id ? "true" : undefined}
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
          : "px-5 py-4",
        className
      )}
    >
      <div
        className={cn(
          "flex shrink-0 items-end justify-between gap-3 border-b border-[#73766f]/45 pb-3.5",
          floating && "mx-5 mt-5"
        )}
      >
        <div className="space-y-1">
          <p className="utility-kicker">Known Index</p>
          <h2 className="text-lg font-semibold tracking-tight">目录</h2>
        </div>

        {!floating ? (
          <button
            type="button"
            onClick={() => setMobileExpanded((prev) => !prev)}
            aria-expanded={mobileExpanded}
            className="chrome-pill px-2.5 py-1 text-[0.62rem] text-muted-foreground hover:text-foreground"
          >
            <span>{items.length} 节</span>
            <ChevronDown
              className={cn(
                "size-3.5 transition-transform duration-200",
                mobileExpanded && "rotate-180"
              )}
              aria-hidden="true"
            />
          </button>
        ) : (
          <span className="font-mono text-[0.64rem] tracking-[0.14em] text-muted-foreground uppercase">
            {items.length} 节
          </span>
        )}
      </div>

      {floating ? (
        <>
          <PerfectScrollbar
            role="region"
            aria-label="文章目录滚动区域"
            tabIndex={0}
            className="mt-4 min-h-0 overflow-y-auto overscroll-contain focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            {indexLinks}
          </PerfectScrollbar>

          <div className="mx-5 mt-auto mb-4 flex shrink-0 items-center justify-between gap-2 border-t border-[#73766f]/40 pt-3 font-mono text-[0.64rem] tracking-[0.14em] text-muted-foreground uppercase">
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="inline-flex items-center gap-1.5 transition hover:text-foreground"
            >
              <ArrowUp className="size-3" aria-hidden="true" />
              顶部
            </button>
            <a
              href="#article-engagement"
              className="inline-flex items-center gap-1.5 transition hover:text-foreground"
            >
              <MessageSquare className="size-3" aria-hidden="true" />
              互动区
            </a>
          </div>
        </>
      ) : mobileExpanded ? (
        indexLinks
      ) : null}
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
