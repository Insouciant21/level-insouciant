import { ImageResponse } from "next/og"
import { notFound } from "next/navigation"

import { getArticleBySlug } from "@/lib/content"
import { siteConfig } from "@/lib/site"

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
  const article = await getArticleBySlug(slug)

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
            "radial-gradient(circle at top left, rgba(217, 150, 72, 0.32), transparent 34%), linear-gradient(135deg, #1f1814 0%, #2b211a 100%)",
          color: "#f5efe1",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 24,
            color: "#d2b690",
          }}
        >
          <div>{siteConfig.name}</div>
          <div>{article.category}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 68, fontWeight: 700, lineHeight: 1.08, maxWidth: "90%" }}>
            {article.title}
          </div>
          <div style={{ fontSize: 28, lineHeight: 1.45, color: "#e6d8bc", maxWidth: "85%" }}>
            {article.desc}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            gap: 16,
            flexWrap: "wrap",
            fontSize: 22,
            color: "#d2b690",
          }}
        >
          {article.tags.map((tag) => (
            <div
              key={tag}
              style={{
                display: "flex",
                padding: "10px 18px",
                borderRadius: 999,
                border: "1px solid rgba(210, 182, 144, 0.3)",
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
