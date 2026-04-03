import type { Metadata } from "next"

import { PageIntro } from "@/components/blog/page-intro"
import { PageShell } from "@/components/blog/page-shell"
import { createPageMetadata } from "@/lib/seo"
import { siteConfig } from "@/lib/site"

export const metadata: Metadata = createPageMetadata({
  title: "关于",
  description: "关于作者、写作方式与持续更新的说明。",
  path: "/about",
})

export default function AboutPage() {
  return (
    <PageShell>
      <PageIntro eyebrow="About" title="关于我" description={siteConfig.about.intro} />

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-5 rounded-3xl border border-border/70 px-6 py-6">
          <h2 className="text-xl font-semibold tracking-tight">写作方法</h2>
          <p className="text-sm leading-7 text-muted-foreground">
            我把这个博客当作持续更新的工作台，而不是一次性展示页。每篇文章都尽量带着明确的问题、边界和可复用的结论出现。
          </p>
          <p className="text-sm leading-7 text-muted-foreground">
            对我来说，写作不是把答案包装得更漂亮，而是把思路整理得更诚实，这会直接影响我后续如何设计页面、组织代码和维护系统。
          </p>
        </div>

        <aside className="space-y-5 rounded-3xl border border-border/70 px-6 py-6">
          <h2 className="text-xl font-semibold tracking-tight">关注方向</h2>
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
