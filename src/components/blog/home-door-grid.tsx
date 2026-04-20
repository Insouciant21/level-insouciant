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

function HomeDoorCard({ article, featured, index, reducedMotion }: HomeDoorCardProps) {
  const signal = getArchiveSignal(article)

  return (
    <Motion.article
      initial={reducedMotion ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: reducedMotion ? 0 : 0.8,
        delay: reducedMotion ? 0 : 0.2 + index * 0.1,
        ease: "easeOut",
      }}
      className={cn(
        "group relative flex flex-col overflow-hidden border-[3px] bg-[#d8d1bd] transition-all duration-700 hover:-translate-y-1 hover:shadow-2xl",
        featured ? "min-h-[24rem] border-black/30 md:col-span-2 md:row-span-2" : "min-h-[18rem] border-black/20"
      )}
    >
      <Link href={`/articles/${article.slug}`} className="absolute inset-0 z-30" aria-label={article.title} />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.16),transparent_34%,rgba(0,0,0,0.08))]" />
      <div className="absolute inset-x-0 top-0 h-28 bg-[linear-gradient(180deg,rgba(255,255,255,0.14),transparent)] opacity-80" />
      <div className="absolute inset-0 shadow-[inset_0_0_44px_rgba(0,0,0,0.16)] transition-opacity duration-500 group-hover:opacity-50" />

      <div className="relative z-10 flex h-full flex-col px-6 py-6">
        <div className="flex items-start justify-between gap-4 text-[0.68rem] font-semibold uppercase tracking-[0.3em]">
          <span className="bg-[#171613] px-2.5 py-1 text-[#f3efe2] shadow-md">{signal.designation}</span>
          <span className="border border-black/15 bg-[#efe8d8]/82 px-2.5 py-1 text-[0.6rem] text-foreground/72 shadow-sm">
            Archive
          </span>
        </div>

        <div className="mt-auto">
          <div className="border border-black/12 bg-[#f8f4eb]/58 px-4 py-4 backdrop-blur-sm transition duration-500 group-hover:-translate-y-[10px] group-hover:bg-[#f8f4eb]/82 group-hover:shadow-[0_22px_36px_-30px_rgba(0,0,0,0.34)]">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
              {article.category}
            </p>
            <h2
              className={cn(
                "mt-3 font-semibold leading-[0.95] tracking-tight text-balance",
                featured ? "text-3xl sm:text-5xl" : "text-3xl sm:text-4xl"
              )}
            >
              {article.title}
            </h2>

            <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-black/10 pt-4 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              <span>LOG: {new Date(article.date).toISOString().slice(0, 10)}</span>
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-black/36 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
          <span className="border-2 border-primary/80 bg-primary px-6 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.32em] text-primary-foreground shadow-[0_0_24px_rgba(47,124,74,0.35)] transition-transform duration-500 group-hover:translate-y-0 group-hover:scale-100 motion-safe:translate-y-[10px] motion-safe:scale-[0.98]">
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
    <div className="grid auto-rows-[18rem] gap-8 md:grid-cols-2 xl:grid-cols-4 xl:gap-10">
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
          duration: reducedMotion ? 0 : 1,
          delay: reducedMotion ? 0 : 0.2 + articles.length * 0.1,
        }}
        className="relative flex min-h-[18rem] flex-col items-center justify-center overflow-hidden border-[3px] border-[#2d2d2d] bg-[#181715] text-[#c54e45] shadow-[inset_0_0_60px_rgba(0,0,0,0.7)]"
      >
        <p className="text-sm font-semibold uppercase tracking-[0.34em]">Dead End</p>
        <p className="absolute bottom-4 left-4 font-mono text-[0.68rem] uppercase tracking-[0.24em] text-[#4e4a44]">
          SEC-ERR-902
        </p>
      </Motion.div>
    </div>
  )
}

export { HomeDoorGrid }
