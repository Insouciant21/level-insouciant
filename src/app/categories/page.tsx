import type { Metadata } from "next"

import { ArchiveSection } from "@/components/blog/archive-section"
import { EmptyState } from "@/components/blog/empty-state"
import { PageIntro } from "@/components/blog/page-intro"
import { PageShell } from "@/components/blog/page-shell"
import { getAllCategories } from "@/lib/content"
import { createPageMetadata } from "@/lib/seo"

export const metadata: Metadata = createPageMetadata({
  title: "分类",
  description: "按内容类型查看文章归档。",
  path: "/categories",
})

export default async function CategoriesPage() {
  const categories = await getAllCategories()

  return (
    <PageShell>
      <PageIntro
        eyebrow="Categories"
        title="分类归档"
        description="分类回答内容属于什么方向，和标签一起构成博客的双层归档结构。"
      />

      {categories.length > 0 ? (
        <ArchiveSection items={categories} title="全部分类" type="categories" />
      ) : (
        <EmptyState title="暂时还没有分类" description="发布文章后，分类会自动从数据库中的文章记录里汇总出来。" />
      )}
    </PageShell>
  )
}
