import type { Metadata } from "next"

import { PageIntro } from "@/components/blog/page-intro"
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
      <PageIntro eyebrow="Manual" title="生存须知" description={siteConfig.about.intro} />

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-5 rounded-3xl border border-border/70 px-6 py-6">
          <h2 className="text-xl font-semibold tracking-tight">记录方式</h2>
          <p className="text-sm leading-7 text-muted-foreground">
            我把这座站点当作一份持续更新的层级工作台，而不是一次性的展示页。每篇记录都尽量带着明确的异样、边界和可复用的结论出现。
          </p>
          <p className="text-sm leading-7 text-muted-foreground">
            对我来说，写作不是把怪异包装得更神秘，而是把思路整理得更诚实。这会直接影响我后续如何设计页面、组织代码，以及为这座层级留下可复查的路径说明。
          </p>
        </div>

        <aside className="space-y-5 rounded-3xl border border-border/70 px-6 py-6">
          <h2 className="text-xl font-semibold tracking-tight">维护者说明</h2>
          <ul className="grid gap-3 text-sm leading-7 text-muted-foreground">
            {siteConfig.about.highlights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <div className="border-t border-border/60 pt-5 text-sm text-muted-foreground">
            <p>{siteConfig.author}</p>
            <p>{siteConfig.email}</p>
          </div>
        </aside>
      </section>
    </PageShell>
  )
}
