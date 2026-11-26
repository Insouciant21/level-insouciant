import Link from "@/lib/navigation"
import { ArrowRight } from "lucide-react"
import { motion as Motion, useReducedMotion } from "motion/react"

import { getArchiveSignal } from "@/lib/archive-presentation"
import { cn } from "@/lib/utils"
import type { ArticleSummary } from "@/types/blog"

type HomeDoorGridProps = {
  articles: ArticleSummary[]
  showDeadEnd?: boolean
}

type HomeDoorCardProps = {
  article: ArticleSummary
  featured: boolean
  wide?: boolean
  index: number
  reducedMotion: boolean
}

function getDoorTitleClass(title: string, featured: boolean) {
  const titleLength = Array.from(title.trim()).length

  if (titleLength >= 24) {
    return "text-xl sm:text-2xl lg:text-3xl"
  }

  if (titleLength >= 14) {
    return "text-xl sm:text-2xl lg:text-4xl"
  }

  return featured
    ? "text-2xl sm:text-3xl lg:text-5xl"
    : "text-2xl sm:text-3xl lg:text-4xl"
}

function getDeadEndLayoutClass(articleCount: number) {
  const mdSpan = articleCount % 2 === 0 ? "md:col-span-2" : "md:col-span-1"

  switch (articleCount) {
    case 1:
      return `${mdSpan} lg:col-span-2 lg:row-span-2`
    case 2:
    case 3:
    case 4:
      return `${mdSpan} lg:col-span-2 lg:row-span-1`
    case 5:
      return `${mdSpan} lg:col-span-1 lg:row-span-1`
    default:
      return `${mdSpan} lg:col-span-4 lg:row-span-1`
  }
}

function HomeDoorCard({
  article,
  featured,
  wide = false,
  index,
  reducedMotion,
}: HomeDoorCardProps) {
  const signal = getArchiveSignal(article)

  return (
    <Motion.article
      initial={reducedMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: reducedMotion ? 0 : 0.34,
        delay: reducedMotion ? 0 : 0.02 + Math.min(index, 5) * 0.04,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={cn(
        "door-card group relative flex flex-col overflow-hidden border shadow-[0_18px_42px_-34px_rgba(0,0,0,0.42)] hover:shadow-[0_26px_54px_-32px_rgba(0,0,0,0.46)]",
        featured
          ? "min-h-[16.5rem] border-[#73766f]/65 sm:min-h-[18rem] lg:col-span-2 lg:row-span-2 lg:min-h-[24rem]"
          : wide
            ? "min-h-[16.5rem] border-[#73766f]/55 sm:min-h-[18rem] lg:col-span-2"
            : "min-h-[16.5rem] border-[#73766f]/55 sm:min-h-[18rem]"
      )}
    >
      <Link
        href={`/articles/${article.slug}`}
        className="absolute inset-0 z-30"
        aria-label={article.title}
      />
      <div className="door-card__transom pointer-events-none absolute inset-x-0 top-0 z-10 h-1" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,252,225,0.12),transparent_36%,rgba(24,27,23,0.1))]" />
      <div className="door-card__shade pointer-events-none absolute inset-0 shadow-[inset_0_0_0_1px_rgba(27,27,22,0.08),inset_0_0_38px_rgba(24,27,23,0.14)]" />

      <div className="relative z-10 flex h-full min-w-0 flex-col gap-3 px-4 py-4 sm:px-5 sm:py-5">
        <div className="flex items-start justify-between gap-3 font-mono text-[0.66rem] font-medium tracking-[0.22em] uppercase sm:gap-4 sm:text-[0.68rem]">
          <span className="utility-charcoal-chip px-2.5 py-1 shadow-sm">
            {signal.designation}
          </span>
          <span className="facility-signage-chip border px-2.5 py-1 text-[0.58rem] shadow-sm sm:text-[0.62rem]">
            Archive
          </span>
        </div>

        <div className="mt-auto">
          <div className="door-card__panel border px-4 py-4 shadow-[0_14px_26px_-24px_rgba(0,0,0,0.3)] group-hover:shadow-[0_20px_34px_-22px_rgba(0,0,0,0.36)]">
            <p className="font-mono text-[0.66rem] font-medium tracking-[0.2em] text-muted-foreground uppercase sm:text-[0.68rem]">
              {article.category}
            </p>
            <h2
              className={cn(
                "mt-2.5 leading-[1.08] font-semibold tracking-tight text-balance break-words",
                getDoorTitleClass(article.title, featured)
              )}
            >
              {article.title}
            </h2>

            {article.desc ? (
              <p
                className={cn(
                  "mt-2.5 text-sm leading-6 text-foreground/75",
                  featured ? "line-clamp-2" : "line-clamp-1"
                )}
              >
                {article.desc}
              </p>
            ) : null}

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#181b17]/14 pt-3 font-mono text-[0.65rem] font-medium tracking-[0.18em] text-muted-foreground uppercase">
              <span>
                LOG: {new Date(article.date).toISOString().slice(0, 10)}
              </span>
              <span className="door-card__enter inline-flex items-center gap-1 font-semibold">
                进入档案
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </Motion.article>
  )
}

function HomeDoorGrid({ articles, showDeadEnd = true }: HomeDoorGridProps) {
  const reducedMotion = useReducedMotion()
  const isCompactTerminusRow = articles.length >= 6

  return (
    <div className="grid auto-rows-[minmax(16.5rem,auto)] gap-4 sm:auto-rows-[minmax(18rem,auto)] md:grid-cols-2 lg:grid-cols-4 xl:gap-5">
      {articles.map((article, index) => (
        <HomeDoorCard
          key={article.slug}
          article={article}
          featured={index === 0 || (articles.length >= 4 && index === 3)}
          wide={articles.length === 2 && index === 1}
          index={index}
          reducedMotion={Boolean(reducedMotion)}
        />
      ))}

      {showDeadEnd ? (
        <Motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: reducedMotion ? 0 : 0.32,
            delay: reducedMotion
              ? 0
              : 0.04 + Math.min(articles.length, 6) * 0.04,
            ease: [0.22, 1, 0.36, 1],
          }}
          className={cn(
            "relative flex flex-col items-center justify-center overflow-hidden rounded-[0.25rem] border border-[#8a4f34]/55 bg-[#181b17] text-center text-[#d9d1ad] shadow-[inset_0_0_48px_rgba(0,0,0,0.8)]",
            getDeadEndLayoutClass(articles.length),
            isCompactTerminusRow
              ? "min-h-[7.5rem] px-5 py-6 sm:px-6"
              : "min-h-[16.5rem] px-5 py-6 sm:min-h-[18rem]"
          )}
        >
          <div className="space-y-1.5 text-center">
            <p className="font-mono text-[0.68rem] tracking-[0.26em] text-[#8a4f34] uppercase">
              SEC-ERR-902 // CORRIDOR SEALED
            </p>
            <p className="text-base font-semibold tracking-[0.2em] text-[#eee9d6] uppercase sm:text-lg">
              Dead End — 前方通道封锁
            </p>
          </div>
        </Motion.div>
      ) : null}
    </div>
  )
}

export { HomeDoorGrid }
