import Link from "next/link"

import { formatDisplayDate } from "@/lib/content"
import type { ArticleSummary } from "@/types/blog"

type HomeTimelineProps = {
  articles: ArticleSummary[]
}

function HomeTimeline({ articles }: HomeTimelineProps) {
  return (
    <section className="surface-panel px-6 py-6 sm:px-7">
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
                  <span className="mt-2 h-full w-px bg-border" />
                ) : null}
              </div>

              <div className="space-y-2 border-b border-border/50 pb-5 last:border-b-0 last:pb-1">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  {formatDisplayDate(article.date)}
                </p>
                <Link
                  href={`/articles/${article.slug}`}
                  className="text-lg font-medium leading-7 transition hover:text-primary sm:text-[1.12rem]"
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
