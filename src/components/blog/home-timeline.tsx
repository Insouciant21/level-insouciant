import Link from "next/link"

import { formatDisplayDate } from "@/lib/content"
import type { ArticleSummary } from "@/types/blog"

type HomeTimelineProps = {
  articles: ArticleSummary[]
}

const timelinePanelClass =
  "public-summary-panel px-6 py-6 sm:px-7"
const timelineEntryClass =
  "public-summary-card-muted space-y-2 border-[#73766f]/46 bg-[#aaa891]/28 px-4 py-4 shadow-[inset_0_1px_0_rgba(255,252,225,0.12),0_14px_28px_-28px_rgba(0,0,0,0.26)] transition duration-700 hover:border-foreground/20 hover:bg-[#d9d1ad]/40"

function HomeTimeline({ articles }: HomeTimelineProps) {
  return (
    <section className={timelinePanelClass}>
      <div className="mb-6">
        <p className="utility-kicker">Observation Log</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">观测日志</h2>
      </div>

      {articles.length > 0 ? (
        <ol className="grid gap-5">
          {articles.slice(0, 5).map((article, index) => (
            <li key={article.slug} className="grid grid-cols-[auto_1fr] gap-4">
              <div className="flex flex-col items-center pt-1">
                <span className="size-3 rounded-full bg-primary" />
                {index < Math.min(articles.length, 5) - 1 ? (
                  <span className="mt-2 h-full w-px bg-[#73766f]/42" />
                ) : null}
              </div>

              <div className={timelineEntryClass}>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  {formatDisplayDate(article.date)}
                </p>
                <Link
                  href={`/articles/${article.slug}`}
                  className="text-lg font-medium leading-7 transition hover:text-destructive sm:text-[1.12rem]"
                >
                  {article.title}
                </Link>
                <p className="text-sm leading-7 text-muted-foreground">{article.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="text-sm leading-7 text-muted-foreground">
          更多记录整理后，这条时间线会继续向更深的走廊延伸。
        </p>
      )}
    </section>
  )
}

export { HomeTimeline }
