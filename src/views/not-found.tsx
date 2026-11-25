import Link from "@/lib/navigation"
import { ArrowLeft, FileStack, Terminal } from "lucide-react"

import { MotionReveal } from "@/components/motion/page-transition"
import { PageShell } from "@/components/blog/page-shell"

export default function NotFound() {
  return (
    <PageShell className="justify-center py-10 sm:py-16">
      <MotionReveal variant="scale">
        <section className="terminal-panel mx-auto w-full max-w-3xl rounded-[0.25rem] border p-6 text-[#d9d1ad] sm:p-10 md:p-12">
          <div className="relative z-10 space-y-8">
            <header className="flex flex-wrap items-start justify-between gap-4 border-b border-[#8a4f34]/45 pb-6">
              <div>
                <p className="font-mono text-xs tracking-[0.26em] text-[#c58b2f] uppercase">
                  ERROR 404 // NO-CLIP BOUNDARY
                </p>
                <h1 className="mt-3 font-serif text-3xl font-bold tracking-tight text-[#eee9d6] sm:text-5xl">
                  层级不可达 / Level Inaccessible
                </h1>
              </div>

              <span className="border border-[#8a4f34]/60 bg-[#8a4f34]/15 px-3 py-1 font-mono text-[0.68rem] tracking-[0.18em] text-[#f08b81] uppercase">
                SEC-ERR-404
              </span>
            </header>

            <div className="space-y-4 font-mono text-xs leading-7 text-[#d9d1ad]/85 sm:text-sm">
              <p className="flex items-start gap-3">
                <span className="font-bold text-[#c58b2f]">&gt;</span>
                <span>
                  你尝试进入的空间尚未录入当前设施架构，或者该档案通道已经被迁移或封存。
                </span>
              </p>
              <p className="flex items-start gap-3">
                <span className="font-bold text-[#c58b2f]">&gt;</span>
                <span>
                  You have attempted to enter a corridor that does not exist in
                  the current archive topology.
                </span>
              </p>
              <p className="flex items-start gap-3 border-l-2 border-[#c58b2f] bg-[#c58b2f]/10 px-3.5 py-2.5 text-[#e2b86c]">
                <span className="font-bold">!</span>
                <span>
                  请勿长时间停留在未编号的盲区，选择下方已知通道返回主设施。
                </span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-[var(--radius)] border border-[var(--safety-exit-green)] bg-[var(--safety-exit-green)] px-5 py-2.5 font-mono text-xs font-semibold tracking-[0.16em] text-[#151712] uppercase transition hover:bg-[var(--safety-exit-green-strong)]"
              >
                <ArrowLeft className="size-4" aria-hidden="true" />
                返回入口中枢
              </Link>

              <Link
                href="/articles"
                className="inline-flex items-center gap-2 rounded-[var(--radius)] border border-white/20 bg-white/5 px-4 py-2.5 font-mono text-xs font-medium tracking-[0.14em] text-[#d9d1ad] uppercase transition hover:border-white/35 hover:bg-white/10"
              >
                <FileStack className="size-4" aria-hidden="true" />
                浏览层级档案
              </Link>

              <Link
                href="/search"
                className="inline-flex items-center gap-2 rounded-[var(--radius)] border border-white/20 bg-white/5 px-4 py-2.5 font-mono text-xs font-medium tracking-[0.14em] text-[#d9d1ad] uppercase transition hover:border-[var(--safety-exit-green)]/50 hover:text-[var(--safety-exit-green-strong)]"
              >
                <Terminal className="size-4" aria-hidden="true" />
                打开检索终端
              </Link>
            </div>
          </div>
        </section>
      </MotionReveal>
    </PageShell>
  )
}
