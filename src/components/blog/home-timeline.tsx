import Link from "@/lib/navigation"
import { ArrowRight } from "lucide-react"

import { getArchiveSignal } from "@/lib/archive-presentation"
import { formatDisplayDate } from "@/lib/content-presentation"
import type { ArticleSummary } from "@/types/blog"

type HomeTimelineProps = {
  articles: ArticleSummary[]
}

const timelinePanelClass = "public-summary-panel px-6 py-6 sm:px-7"
const timelineEntryClass =
  "public-summary-card-muted group block border-[#73766f]/48 bg-[#aaa891]/26 px-4 py-3.5 transition duration-200 hover:border-foreground/28 hover:bg-[#d9d1ad]/52"

function HomeTimeline({ articles }: HomeTimelineProps) {
  return (
    <section className={timelinePanelClass}>
      <header className="site-section-header mb-5">
        <div>
          <p className="utility-kicker">Observation Log</p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">
            观测台账
          </h2>
        </div>

        <Link
          href="/articles"
          className="chrome-pill hover:border-foreground/35 hover:bg-[#d9d1ad]/65"
        >
          <span>全部 {articles.length} 份</span>
          <ArrowRight className="size-3.5" aria-hidden="true" />
        </Link>
      </header>

      {articles.length > 0 ? (
        <ol className="grid gap-2.5">
          {articles.slice(0, 6).map((article) => {
            const signal = getArchiveSignal(article)

            return (
              <li key={article.slug}>
                <Link
                  href={`/articles/${article.slug}`}
                  className={timelineEntryClass}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[0.68rem] tracking-[0.14em] text-muted-foreground uppercase">
                    <div className="flex items-center gap-2">
                      <span className="utility-charcoal-chip px-1.5 py-0.5 text-[0.62rem]">
                        {signal.designation}
                      </span>
                      <span>{article.category}</span>
                    </div>
                    <time dateTime={article.date}>
                      {formatDisplayDate(article.date)}
                    </time>
                  </div>

                  <div className="mt-2 flex items-baseline justify-between gap-3">
                    <h3 className="text-base leading-6 font-semibold tracking-tight text-foreground transition-colors group-hover:text-destructive sm:text-[1.05rem]">
                      {article.title}
                    </h3>
                    <ArrowRight
                      className="size-3.5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground"
                      aria-hidden="true"
                    />
                  </div>

                  {article.desc ? (
                    <p className="mt-1 line-clamp-1 text-sm leading-6 text-muted-foreground">
                      {article.desc}
                    </p>
                  ) : null}
                </Link>
              </li>
            )
          })}
        </ol>
      ) : (
        <p className="text-sm leading-7 text-muted-foreground">
          更多记录整理后，这条台账会继续向更深的走廊延伸。
        </p>
      )}
    </section>
  )
}

export { HomeTimeline }
