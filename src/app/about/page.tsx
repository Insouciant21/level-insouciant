import type { Metadata } from "next"
import Link from "next/link"
import { Anchor, FileStack, Users, Zap } from "lucide-react"

import { MotionReveal } from "@/components/motion/page-transition"
import { PageShell } from "@/components/blog/page-shell"
import { createPageMetadata } from "@/lib/seo"
import { siteConfig } from "@/lib/site"

export const metadata: Metadata = createPageMetadata({
  title: "生存须知",
  description: "关于层级维护者、记录方式与持续更新的说明。",
  path: "/about",
})

export default function AboutPage() {
  return (
    <PageShell>
      <section className="grid gap-10 lg:grid-cols-[320px_minmax(0,1fr)] lg:items-start">
        <MotionReveal variant="left">
          <aside className="grid gap-8 lg:sticky lg:top-28">
            <div className="space-y-4 border-r-4 border-foreground/80 pr-6">
              <p className="utility-kicker">Official Designation</p>
              <h1 className="text-5xl font-semibold uppercase tracking-tight">M.E.G.</h1>
              <p className="font-mono text-xs leading-7 text-muted-foreground">
                Major Explorer Group
                <br />
                Archive Node: Level Insouciant
                <br />
                Status: Operational
              </p>
            </div>

            <div className="flex h-56 items-center justify-center bg-[#171613] text-[#4c4943] shadow-[inset_0_0_36px_rgba(0,0,0,0.72)]">
              <Anchor className="size-24" />
            </div>

            <div className="grid gap-4 font-mono text-sm text-muted-foreground">
              <Link href="/articles" className="flex items-center justify-between border-b border-border/70 pb-2 hover:text-accent">
                <span className="font-semibold uppercase tracking-[0.24em]">Archive Access</span>
                <FileStack className="size-4" />
              </Link>
              <Link href={`mailto:${siteConfig.email}`} className="flex items-center justify-between border-b border-border/70 pb-2 hover:text-accent">
                <span className="font-semibold uppercase tracking-[0.24em]">Transmission</span>
                <Zap className="size-4" />
              </Link>
            </div>
          </aside>
        </MotionReveal>

        <MotionReveal variant="right" delay={0.3}>
          <article className="dossier-paper px-7 py-8 sm:px-10 sm:py-10">
            <p className="border-l-4 border-accent bg-accent/10 px-5 py-4 text-2xl font-semibold italic text-foreground">
              “To map the unmappable. To survive the unlivable. To record what was meant to be forgotten.”
            </p>

            <div className="mt-8 space-y-6 text-base leading-8 text-foreground/84">
              <p>{siteConfig.about.intro}</p>
              <p>
                我把这座站点当成一份会持续演化的开放档案，而不是一次性的个人展示页。写作、前端和世界观记录会被放进同一套秩序里，因为它们本质上都在处理同一个问题：如何给后来者留下可信的路径标记。
              </p>
              <p>
                我不太相信夸张的传奇，也不太喜欢把异常讲成噱头。更可靠的方式，是把边界、证据、命名和可复查的结构先讲清楚，再决定哪些故事值得继续深入。
              </p>
            </div>

            <div className="mt-12">
              <h2 className="flex items-center gap-3 border-b-2 border-foreground/80 pb-3 text-xl font-semibold uppercase tracking-[0.2em]">
                <Users className="size-5 text-accent" />
                Organizational Structure
              </h2>

              <ul className="mt-6 grid gap-4">
                {siteConfig.about.highlights.map((item, index) => (
                  <li key={item} className={index === siteConfig.about.highlights.length - 1 ? "bg-[#2d1715] px-5 py-4 text-[#f5e6e1]" : "bg-[#ddd5bf] px-5 py-4"}>
                    <div className="grid gap-2 md:grid-cols-[180px_minmax(0,1fr)] md:items-start">
                      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-foreground/80">
                        Protocol {String(index + 1).padStart(2, "0")}
                      </p>
                      <p className={index === siteConfig.about.highlights.length - 1 ? "text-sm leading-7 text-[#f5e6e1]" : "text-sm leading-7 text-foreground/76"}>
                        {item}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-8 border-t border-border/60 pt-5 text-sm text-muted-foreground">
                <p>{siteConfig.author}</p>
                <p>{siteConfig.email}</p>
              </div>
            </div>
          </article>
        </MotionReveal>
      </section>
    </PageShell>
  )
}
