import { ImageResponse } from "next/og"
import { notFound } from "next/navigation"

import { getArticleBySlug } from "@/lib/content"
import { getSiteConfig } from "@/lib/site-config"

export const size = {
  width: 1200,
  height: 630,
}

export const contentType = "image/png"

type ArticleOgImageProps = {
  params: Promise<{
    slug: string
  }>
}

export default async function ArticleOpenGraphImage({ params }: ArticleOgImageProps) {
  const { slug } = await params
  const [article, siteConfig] = await Promise.all([
    getArticleBySlug(slug),
    getSiteConfig(),
  ])

  if (!article) {
    notFound()
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px",
          background:
            "radial-gradient(circle at top left, rgba(255,191,0,0.22), transparent 34%), linear-gradient(135deg, #f5f5f0 0%, #e8e3d3 100%)",
          color: "#1a1a1a",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 24,
            color: "#4a4a4a",
          }}
        >
          <div>{siteConfig.name}</div>
          <div>{article.category}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 68, fontWeight: 700, lineHeight: 1.08, maxWidth: "90%" }}>
            {article.title}
          </div>
          <div style={{ fontSize: 28, lineHeight: 1.45, color: "#4a4a4a", maxWidth: "85%" }}>
            {article.desc}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            gap: 16,
            flexWrap: "wrap",
            fontSize: 22,
            color: "#1a1a1a",
          }}
        >
          {article.tags.map((tag) => (
            <div
              key={tag}
              style={{
                display: "flex",
                padding: "10px 18px",
                borderRadius: 999,
                border: "1px solid rgba(0, 0, 0, 0.16)",
                background: "rgba(245,245,240,0.82)",
              }}
            >
              {tag}
            </div>
          ))}
        </div>
      </div>
    ),
    size
  )
}
