import type { Metadata } from "next"
import Link from "next/link"

import { EmptyState } from "@/components/blog/empty-state"
import { PageIntro } from "@/components/blog/page-intro"
import { PageShell } from "@/components/blog/page-shell"
import { TagAggregateSection } from "@/components/blog/tag-aggregate-section"
import { getTagAggregates } from "@/lib/content"
import { createPageMetadata } from "@/lib/seo"

export const metadata: Metadata = createPageMetadata({
  title: "标签",
  description: "按主题查看文章归档。",
  path: "/tags",
})

export default async function TagsPage() {
  const tags = await getTagAggregates()

  return (
    <PageShell>
      <PageIntro
        eyebrow="Tags"
        title="标签归档"
        description="标签用于组织主题维度。这里既能快速总览全部主题，也能直接下钻到每个标签下的文章集合。"
      />

      {tags.length > 0 ? (
        <div className="grid gap-6">
          <section className="surface-panel px-6 py-6">
            <div className="flex flex-col gap-4 border-b border-border/60 pb-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Overview</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">标签总览</h2>
              </div>
              <p className="text-sm text-muted-foreground">{tags.length} 个标签主题</p>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              {tags.map((tag) => (
                <Link
                  key={tag.slug}
                  href={`#${tag.slug}`}
                  className="inline-flex items-center gap-2 border border-border/70 bg-muted/35 px-4 py-2 text-sm font-medium transition hover:border-primary/40 hover:bg-primary/10"
                >
                  <span>{tag.name}</span>
                  <span className="text-xs text-muted-foreground">{tag.count}</span>
                </Link>
              ))}
            </div>
          </section>

          <div className="grid gap-6">
            {tags.map((tag) => (
              <TagAggregateSection key={tag.slug} tag={tag} />
            ))}
          </div>
        </div>
      ) : (
        <EmptyState title="暂时还没有标签" description="发布文章后，标签会自动从文章元数据中聚合出来。" />
      )}
    </PageShell>
  )
}
