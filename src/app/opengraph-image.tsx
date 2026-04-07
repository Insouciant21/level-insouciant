import { ImageResponse } from "next/og"

import { siteConfig } from "@/lib/site"

export const size = {
  width: 1200,
  height: 630,
}

export const contentType = "image/png"

export default function OpenGraphImage() {
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
            "radial-gradient(circle at top left, rgba(191, 203, 142, 0.42), transparent 34%), linear-gradient(135deg, #f4f1e5 0%, #e8e3cf 100%)",
          color: "#3a3d2d",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 24,
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: "#70745b",
          }}
        >
          {siteConfig.hero.eyebrow}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 72, fontWeight: 700, lineHeight: 1.1, maxWidth: "85%" }}>
            {siteConfig.name}
          </div>
          <div style={{ fontSize: 30, lineHeight: 1.5, color: "#535741", maxWidth: "78%" }}>
            {siteConfig.description}
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 24, color: "#70745b" }}>{siteConfig.url}</div>
      </div>
    ),
    size
  )
}
