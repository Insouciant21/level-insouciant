import { useEffect, useState } from "react"
import Link from "@/lib/navigation"
import { motion as Motion } from "motion/react"
import { ArrowRight, Cpu, DatabaseZap, Terminal, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getArchiveSignal } from "@/lib/archive-presentation"
import { formatDisplayDate } from "@/lib/content-presentation"
import type { ArticleSummary } from "@/types/blog"

type SearchConsoleProps = {
  initialQuery?: string
}

type SearchResponse = {
  results?: ArticleSummary[]
  error?: string
}

const searchConsoleClass =
  "terminal-panel relative overflow-hidden rounded-[0.25rem] border p-5 sm:p-8 md:p-10"
const searchInputRowClass =
  "flex items-center gap-3 rounded-[var(--radius)] border border-primary/35 bg-[#12140f] px-3.5 py-2.5 sm:px-4 sm:py-3"
const searchActionClass =
  "self-end rounded-[var(--radius)] border border-primary/65 bg-primary px-6 py-2.5 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary-foreground transition-colors hover:border-primary/80 hover:bg-primary/85"
const searchResultClass =
  "group flex flex-col gap-2 rounded-[var(--radius)] border border-primary/15 bg-[#12140f]/60 p-4 text-[#d9d1ad] transition duration-200 hover:border-primary/45 hover:bg-primary/10"

function SearchConsole({ initialQuery = "" }: SearchConsoleProps) {
  const normalizedInitialQuery = initialQuery.trim()
  const [query, setQuery] = useState(initialQuery)
  const [isSearching, setIsSearching] = useState(
    Boolean(normalizedInitialQuery)
  )
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

      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(activeQuery)}`,
          {
            signal: controller.signal,
            cache: "no-store",
          }
        )
        const payload = (await response.json()) as SearchResponse

        if (!response.ok) {
          throw new Error(payload.error ?? "SEARCH_FAILED")
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
        setError(
          caughtError instanceof Error ? caughtError.message : "SEARCH_FAILED"
        )
      }
    }

    void runSearch()

    return () => {
      isActive = false
      controller.abort()
    }
  }, [activeQuery, searchRun])

  function handleClear() {
    setQuery("")
    setActiveQuery("")
    setResults(null)
    setError(null)
    setIsSearching(false)
    window.history.replaceState(null, "", "/search")
  }

  return (
    <div className="mx-auto w-full max-w-[840px] px-0 py-6 font-mono text-[#d9d1ad] sm:px-4 sm:py-10">
      <Motion.div
        initial={{ opacity: 0, scale: 0.99 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35 }}
        className={searchConsoleClass}
      >
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0)_50%,rgba(0,0,0,1)_50%)] bg-[length:100%_4px] opacity-[0.05]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.4)_100%)]" />

        <header className="relative z-10 mb-8 flex flex-wrap items-center justify-between gap-3 border-b border-primary/25 pb-4">
          <div className="flex items-center gap-3 text-xs font-semibold tracking-[0.22em] text-primary uppercase">
            <Terminal className="size-4 text-primary" aria-hidden="true" />
            <span>Lookup Console v2.4 // 档案检索终端</span>
          </div>
          <div className="flex items-center gap-2 text-[0.65rem] tracking-[0.18em] text-[#9aa79a] uppercase">
            <span className="size-1.5 bg-primary" aria-hidden="true" />
            <span>DB READY</span>
            <Cpu className="ml-1 size-4 text-[#73766f]" aria-hidden="true" />
          </div>
        </header>

        <form
          method="post"
          onSubmit={(event) => {
            event.preventDefault()

            const nextQuery = query.trim()
            if (!nextQuery) {
              handleClear()
              return
            }

            setActiveQuery(nextQuery)
            setSearchRun((current) => current + 1)
            window.history.replaceState(
              null,
              "",
              `/search?q=${encodeURIComponent(nextQuery)}`
            )
          }}
          className="relative z-10 flex flex-col gap-5"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <Label
              htmlFor="archive-search-query"
              className="text-xs font-semibold tracking-[0.18em] text-[var(--safety-exit-green-strong)] uppercase"
            >
              输入层级标题、编号、分类或标签关键词
            </Label>
            <span className="text-[0.65rem] tracking-[0.14em] text-[#9aa79a] uppercase">
              ENTER 执行 · ESC 清空
            </span>
          </div>

          <div className={searchInputRowClass}>
            <DatabaseZap
              className="size-5 shrink-0 text-primary/70"
              aria-hidden="true"
            />
            <Input
              id="archive-search-query"
              autoFocus
              type="text"
              value={query}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  handleClear()
                }
              }}
              onChange={(event) => {
                const nextValue = event.target.value
                setQuery(nextValue)

                if (!nextValue.trim()) {
                  setResults(null)
                  setError(null)
                  window.history.replaceState(null, "", "/search")
                }
              }}
              className="h-auto w-full rounded-none border-0 bg-transparent px-0 text-lg text-[#edf3e9] caret-primary shadow-none ring-0 outline-none placeholder:text-[#748073] focus-visible:border-0 focus-visible:ring-0 sm:text-2xl"
              placeholder="输入关键词以查询 M.E.G. 公开档案..."
            />
            {query ? (
              <button
                type="button"
                aria-label="清空搜索关键词"
                onClick={handleClear}
                className="shrink-0 rounded-[var(--radius)] border border-white/10 p-1.5 text-[#9aa79a] transition hover:border-primary/40 hover:text-[#edf3e9]"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            ) : null}
          </div>

          <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-[#9aa79a]">
              支持匹配文章标题、摘要、标签、分类与正文片段
            </span>
            <Button type="submit" className={searchActionClass} size="default">
              {isSearching ? "正在检索..." : "执行检索"}
            </Button>
          </div>
        </form>

        <div
          className="relative z-10 mt-10 min-h-[180px] text-sm"
          aria-live="polite"
        >
          {!isSearching && !results && (
            <div className="flex flex-col gap-2 border-t border-primary/20 pt-6 text-xs text-[#9aa79a]">
              <div>&gt; AWAITING INPUT // 等待检索指令</div>
              <div>&gt; SYSTEM READY // 已连接公开档案索引</div>
            </div>
          )}

          {isSearching && (
            <div className="flex flex-col gap-2 border-t border-primary/20 pt-6 text-xs">
              <div className="text-[var(--warning-amber)]">
                &gt; PROCESSING QUERY: {activeQuery}
              </div>
              <div className="text-primary">
                &gt; ACCESSING ARCHIVE STORAGE...
              </div>
            </div>
          )}

          {results && !isSearching && (
            <Motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-3 border-t border-primary/25 pt-6"
            >
              {error ? (
                <div className="text-xs text-[#f08b81]">
                  &gt; CONSOLE ERROR: {error}
                </div>
              ) : (
                <div className="text-xs tracking-[0.12em] text-[#9aa79a] uppercase">
                  &gt; FOUND {results.length} MATCHES FOR &ldquo;{activeQuery}
                  &rdquo;
                </div>
              )}

              {!error && results.length === 0 ? (
                <div className="rounded-[var(--radius)] border border-dashed border-white/15 bg-black/25 px-4 py-6 text-xs leading-6 text-[#9aa79a]">
                  &gt; NO RECORDS FOUND //
                  未检索到匹配的公开档案，请尝试更换关键词。
                </div>
              ) : null}

              {!error
                ? results.map((article, index) => {
                    const signal = getArchiveSignal(article)

                    return (
                      <Link
                        key={article.slug}
                        href={`/articles/${article.slug}`}
                        className={searchResultClass}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 text-[0.68rem] tracking-[0.16em] text-[#9aa79a] uppercase">
                          <div className="flex items-center gap-2">
                            <span className="text-primary">
                              [{String(index + 1).padStart(2, "0")}]
                            </span>
                            <span className="border border-primary/35 bg-primary/12 px-1.5 py-0.5 text-[var(--safety-exit-green-strong)]">
                              {signal.designation}
                            </span>
                            <span>{article.category}</span>
                          </div>
                          <span>{formatDisplayDate(article.date)}</span>
                        </div>

                        <div className="flex items-center justify-between gap-3">
                          <span className="font-sans text-base font-semibold tracking-tight text-[#edf3e9] transition-colors group-hover:text-[var(--safety-exit-green-strong)] sm:text-lg">
                            {article.title}
                          </span>
                          <ArrowRight
                            className="size-4 shrink-0 text-[#9aa79a] transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--safety-exit-green-strong)]"
                            aria-hidden="true"
                          />
                        </div>

                        {article.desc ? (
                          <p className="line-clamp-2 font-sans text-xs leading-6 text-[#9aa79a]">
                            {article.desc}
                          </p>
                        ) : null}
                      </Link>
                    )
                  })
                : null}
            </Motion.div>
          )}
        </div>
      </Motion.div>
    </div>
  )
}

export { SearchConsole }
