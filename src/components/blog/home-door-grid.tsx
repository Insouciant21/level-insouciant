"use client"

import Link from "next/link"
import { motion as Motion, useReducedMotion } from "motion/react"

import { getArchiveSignal } from "@/lib/archive-presentation"
import { cn } from "@/lib/utils"
import type { ArticleSummary } from "@/types/blog"

type HomeDoorGridProps = {
  articles: ArticleSummary[]
}

type HomeDoorCardProps = {
  article: ArticleSummary
  featured: boolean
  index: number
  reducedMotion: boolean
}

function HomeDoorCard({
  article,
  featured,
  index,
  reducedMotion,
}: HomeDoorCardProps) {
  const signal = getArchiveSignal(article)

  return (
    <Motion.article
      initial={reducedMotion ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={
        reducedMotion
          ? undefined
          : {
              y: -4,
              filter: "brightness(0.985) saturate(0.94)",
              transition: { duration: 1.2, ease: [0.17, 0.67, 0.16, 1] },
            }
      }
      transition={{
        duration: reducedMotion ? 0 : 1.05,
        delay: reducedMotion ? 0 : 0.24 + index * 0.13,
        ease: "easeOut",
      }}
      className={cn(
        "door-card group relative flex flex-col overflow-hidden border shadow-[0_26px_54px_-36px_rgba(0,0,0,0.38)] hover:shadow-[0_36px_76px_-34px_rgba(0,0,0,0.42)]",
        featured
          ? "min-h-[16rem] border-[#73766f]/60 sm:min-h-[18rem] lg:col-span-2 lg:row-span-2 lg:min-h-[24rem]"
          : "min-h-[16rem] border-[#73766f]/50 sm:min-h-[18rem]"
      )}
    >
      <Link
        href={`/articles/${article.slug}`}
        className="absolute inset-0 z-30"
        aria-label={article.title}
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,252,225,0.12),transparent_34%,rgba(24,27,23,0.08))]" />
      <div className="absolute inset-x-0 top-0 h-28 bg-[linear-gradient(180deg,rgba(255,252,225,0.12),transparent)] opacity-80" />
      <div className="door-card__shade absolute inset-0 shadow-[inset_0_0_44px_rgba(24,27,23,0.16)]" />

      <div className="relative z-10 flex h-full min-w-0 flex-col px-4 py-4 sm:px-5 sm:py-5">
        <div className="flex items-start justify-between gap-3 text-[0.66rem] font-semibold tracking-[0.28em] uppercase sm:gap-4 sm:text-[0.68rem] sm:tracking-[0.3em]">
          <span className="utility-charcoal-chip px-2.5 py-1 shadow-md">
            {signal.designation}
          </span>
          <span className="facility-signage-chip border px-2.5 py-1 text-[0.56rem] shadow-sm sm:text-[0.6rem]">
            Archive
          </span>
        </div>

        <div className="mt-auto">
          <div className="door-card__panel border px-4 py-4 shadow-[0_18px_30px_-28px_rgba(0,0,0,0.28)] backdrop-blur-sm group-hover:shadow-[0_26px_40px_-24px_rgba(0,0,0,0.34)]">
            <p className="text-[0.66rem] font-semibold tracking-[0.24em] text-muted-foreground uppercase sm:text-[0.68rem] sm:tracking-[0.28em]">
              {article.category}
            </p>
            <h2
              className={cn(
                "mt-3 leading-[0.95] font-semibold tracking-tight text-balance break-words",
                featured
                  ? "text-2xl sm:text-3xl lg:text-5xl"
                  : "text-2xl sm:text-3xl lg:text-4xl"
              )}
            >
              {article.title}
            </h2>

            <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-[#181b17]/12 pt-4 text-[0.66rem] font-semibold tracking-[0.2em] text-muted-foreground uppercase sm:text-[0.68rem] sm:tracking-[0.24em]">
              <span>
                LOG: {new Date(article.date).toISOString().slice(0, 10)}
              </span>
            </div>
          </div>
        </div>

        <div className="door-card__overlay pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
          <span className="door-card__signage border-2 px-4 py-2 text-[0.62rem] font-semibold tracking-[0.24em] uppercase sm:px-6 sm:text-[0.72rem] sm:tracking-[0.32em]">
            Enter Archive
          </span>
        </div>
      </div>
    </Motion.article>
  )
}

function HomeDoorGrid({ articles }: HomeDoorGridProps) {
  const reducedMotion = useReducedMotion()

  return (
    <div className="grid auto-rows-[16rem] gap-4 sm:auto-rows-[18rem] md:grid-cols-2 lg:grid-cols-4 xl:gap-6">
      {articles.map((article, index) => (
        <HomeDoorCard
          key={article.slug}
          article={article}
          featured={index === 0 || index === 3}
          index={index}
          reducedMotion={Boolean(reducedMotion)}
        />
      ))}

      <Motion.div
        initial={reducedMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: reducedMotion ? 0 : 1.15,
          delay: reducedMotion ? 0 : 0.28 + articles.length * 0.13,
        }}
        className="relative flex min-h-[16rem] flex-col items-center justify-center overflow-hidden rounded-md border border-[#73766f]/42 bg-[#181b17] px-4 text-center text-[#8a4f34] shadow-[inset_0_0_60px_rgba(0,0,0,0.82)] sm:min-h-[18rem]"
      >
        <p className="text-sm font-semibold tracking-[0.34em] uppercase">
          Dead End
        </p>
        <p className="absolute bottom-4 left-4 font-mono text-[0.68rem] tracking-[0.24em] text-[#73766f]/58 uppercase">
          SEC-ERR-902
        </p>
      </Motion.div>
    </div>
  )
}

export { HomeDoorGrid }
