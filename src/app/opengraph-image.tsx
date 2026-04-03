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
            "radial-gradient(circle at top left, rgba(250, 210, 135, 0.45), transparent 34%), linear-gradient(135deg, #faf7f0 0%, #f5eee0 100%)",
          color: "#31251f",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 24,
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: "#7a6553",
          }}
        >
          {siteConfig.hero.eyebrow}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 72, fontWeight: 700, lineHeight: 1.1, maxWidth: "85%" }}>
            {siteConfig.name}
          </div>
          <div style={{ fontSize: 30, lineHeight: 1.5, color: "#5c4b40", maxWidth: "78%" }}>
            {siteConfig.description}
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 24, color: "#7a6553" }}>{siteConfig.url}</div>
      </div>
    ),
    size
  )
}
