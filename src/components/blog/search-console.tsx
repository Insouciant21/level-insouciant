"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion as Motion } from "motion/react"
import { Cpu, DatabaseZap, Terminal } from "lucide-react"

import { getArchiveSignal } from "@/lib/archive-presentation"
import type { ArticleSummary } from "@/types/blog"

type SearchConsoleProps = {
  initialQuery?: string
}

type SearchResponse = {
  results?: ArticleSummary[]
  error?: string
}

const searchConsoleClass =
  "terminal-panel relative overflow-hidden border-[3px] p-8 md:p-12"
const searchInputRowClass =
  "flex items-center gap-4 border-l-4 border-primary bg-[#12140f] p-4"
const searchActionClass =
  "self-end border border-primary/65 bg-primary px-8 py-3 font-sans text-sm font-bold uppercase tracking-widest text-primary-foreground transition-colors hover:border-primary/80 hover:bg-primary/85"
const searchResultClass =
  "flex cursor-crosshair items-center gap-4 border border-transparent p-4 text-primary transition-all hover:border-primary/30 hover:bg-primary/10 hover:text-primary"

function formatRecordLabel(article: ArticleSummary) {
  const signal = getArchiveSignal(article)
  const normalizedTitle = article.title
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9\u4e00-\u9fa5]+/g, "_")
    .replace(/^_+|_+$/g, "")

  return `RECORD_${signal.designation.replace("-", "")}_${normalizedTitle}`
}

function SearchConsole({ initialQuery = "" }: SearchConsoleProps) {
  const normalizedInitialQuery = initialQuery.trim()
  const [query, setQuery] = useState(initialQuery)
  const [isSearching, setIsSearching] = useState(Boolean(normalizedInitialQuery))
  const [results, setResults] = useState<ArticleSummary[] | null>(null)
  const [activeQuery, setActiveQuery] = useState(normalizedInitialQuery)
  const [searchRun, setSearchRun] = useState(normalizedInitialQuery ? 1 : 0)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!searchRun || !activeQuery) {
      return
    }

    let isActive = true
    const controller = new AbortController()

    async function runSearch() {
      setIsSearching(true)
      setResults(null)
      setError(null)

      const startedAt = Date.now()

      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(activeQuery)}`, {
          signal: controller.signal,
          cache: "no-store",
        })
        const payload = (await response.json()) as SearchResponse

        if (!response.ok) {
          throw new Error(payload.error ?? "SEARCH_FAILED")
        }

        const elapsed = Date.now() - startedAt
        const remainingDelay = Math.max(0, 900 - elapsed)

        if (remainingDelay > 0) {
          await new Promise((resolve) => window.setTimeout(resolve, remainingDelay))
        }

        if (!isActive) {
          return
        }

        setResults(payload.results ?? [])
        setIsSearching(false)
      } catch (caughtError) {
        if (controller.signal.aborted || !isActive) {
          return
        }

        setResults([])
        setIsSearching(false)
        setError(caughtError instanceof Error ? caughtError.message : "SEARCH_FAILED")
      }
    }

    void runSearch()

    return () => {
      isActive = false
      controller.abort()
    }
  }, [activeQuery, searchRun])

  return (
    <div className="mx-auto w-full max-w-[800px] px-6 py-20 font-mono text-[#1a1a1a]">
      <Motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className={searchConsoleClass}
      >
        <div className="pointer-events-none absolute inset-0 opacity-[0.05] bg-[linear-gradient(rgba(255,255,255,0)_50%,rgba(0,0,0,1)_50%)] bg-[length:100%_4px]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.4)_100%)]" />

        <header className="relative z-10 mb-12 flex items-center justify-between border-b-2 border-primary/20 pb-4">
          <div className="flex items-center gap-4 text-xs font-sans font-bold uppercase tracking-[0.3em]">
            <Terminal className="h-5 w-5 animate-pulse text-primary" />
            Lookup Console v2.4
          </div>
          <Cpu className="h-5 w-5 text-[#73766f]" />
        </header>

        <form
          onSubmit={(event) => {
            event.preventDefault()

            const nextQuery = query.trim()
            if (!nextQuery) {
              return
            }

            setActiveQuery(nextQuery)
            setSearchRun((current) => current + 1)
            window.history.replaceState(null, "", `/search?q=${encodeURIComponent(nextQuery)}`)
          }}
          className="relative z-10 flex flex-col gap-6"
        >
          <label className="text-sm font-bold uppercase tracking-widest text-primary/70">
            Enter Entity/Level Designation
          </label>
          <div className={searchInputRowClass}>
            <DatabaseZap className="h-6 w-6 text-primary/50" />
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value)

                if (!event.target.value.trim()) {
                  window.history.replaceState(null, "", "/search")
                }
              }}
              className="w-full bg-transparent text-xl text-primary caret-primary outline-none placeholder:text-primary/20 md:text-3xl"
              placeholder="_"
            />
          </div>
          <button
            type="submit"
            className={searchActionClass}
          >
            {isSearching ? "Querying Database..." : "Execute Search"}
          </button>
        </form>

        <div className="mt-12 min-h-[200px] text-sm">
          {!isSearching && !results && (
            <div className="flex flex-col gap-2 opacity-50 animate-pulse">
              <div>&gt; AWAITING INPUT</div>
              <div>&gt; SYSTEM READY</div>
            </div>
          )}

          {isSearching && (
            <div className="flex flex-col gap-2">
              <div className="text-accent">&gt; PROCESSING QUERY: {activeQuery}</div>
              <div className="animate-pulse">&gt; ACCESSING DEEP STORAGE...</div>
            </div>
          )}

          {results && !isSearching && (
            <Motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col gap-4 border-t-2 border-primary/20 pt-8"
            >
              {error ? (
                <div className="text-destructive">&gt; CONSOLE ERROR: {error}</div>
              ) : (
                <div className="text-[#73766f]">&gt; FOUND {results.length} MATCHES</div>
              )}

              {!error && results.length === 0 ? (
                <div className="text-[#73766f]">&gt; NO RECORDS FOUND FOR THIS QUERY</div>
              ) : null}

              {!error
                ? results.map((article, index) => (
                    <Link
                      key={article.slug}
                      href={`/articles/${article.slug}`}
                      className={searchResultClass}
                    >
                      <span className="opacity-50">[{index}]</span>
                      <span>{formatRecordLabel(article)}</span>
                      <span className="ml-auto opacity-50">&gt;&gt;</span>
                    </Link>
                  ))
                : null}
            </Motion.div>
          )}
        </div>
      </Motion.div>
    </div>
  )
}

export { SearchConsole }
