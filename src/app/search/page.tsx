import type { Metadata } from "next"

import { PageShell } from "@/components/blog/page-shell"
import { SearchConsole } from "@/components/blog/search-console"
import { createPageMetadata } from "@/lib/seo"
import { getSiteConfig } from "@/lib/site-config"

type SearchPageProps = {
  searchParams: Promise<{
    q?: string
  }>
}

export async function generateMetadata(): Promise<Metadata> {
  const siteConfig = await getSiteConfig()

  return {
    ...createPageMetadata(
      {
        title: "搜索",
        description: "按标题、摘要、正文、分类和标签检索层级档案。",
        path: "/search",
      },
      siteConfig
    ),
    robots: {
      index: false,
      follow: true,
    },
  }
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q = "" } = await searchParams

  return (
    <PageShell className="gap-0 py-0">
      <SearchConsole initialQuery={q} />
    </PageShell>
  )
}
