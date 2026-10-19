import { ImageResponse } from "@vercel/og"

import { getSiteConfig } from "@/lib/site-config"

export const size = {
  width: 1200,
  height: 630,
}

export const contentType = "image/png"

const responseHeaders = {
  "content-type": "image/png",
  "cache-control": "public, s-maxage=3600, stale-while-revalidate=86400",
}

export default async function OpenGraphImage() {
  const siteConfig = await getSiteConfig()

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "64px",
        background:
          "radial-gradient(circle at top left, rgba(255,191,0,0.24), transparent 34%), linear-gradient(135deg, #f5f5f0 0%, #e8e3d3 100%)",
        color: "#1a1a1a",
      }}
    >
      <div
        style={{
          display: "flex",
          fontSize: 24,
          letterSpacing: "0.28em",
          textTransform: "uppercase",
          color: "#4a4a4a",
        }}
      >
        Facility Hub // Entry Node
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div
          style={{
            fontSize: 72,
            fontWeight: 700,
            lineHeight: 1.1,
            maxWidth: "85%",
          }}
        >
          {siteConfig.name}
        </div>
        <div
          style={{
            fontSize: 30,
            lineHeight: 1.5,
            color: "#4a4a4a",
            maxWidth: "78%",
          }}
        >
          {siteConfig.description}
        </div>
      </div>
      <div style={{ display: "flex", fontSize: 24, color: "#4a4a4a" }}>
        {siteConfig.url}
      </div>
    </div>,
    {
      ...size,
      headers: responseHeaders,
    }
  )
}
