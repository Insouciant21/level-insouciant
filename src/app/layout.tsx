import type { Metadata } from "next"
import type { ReactNode } from "react"
import { IBM_Plex_Mono, Manrope } from "next/font/google"

import "katex/dist/katex.min.css"
import "./globals.css"
import { SiteFooter } from "@/components/blog/site-footer"
import { SiteHeader } from "@/components/blog/site-header"
import { ThemeProvider } from "@/components/theme-provider"
import { createPageMetadata, createWebsiteJsonLdString } from "@/lib/seo"
import { siteConfig } from "@/lib/site"
import { cn } from "@/lib/utils"

const manrope = Manrope({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  ...createPageMetadata({
    title: siteConfig.name,
    description: siteConfig.description,
    path: "/",
  }),
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.author }],
  creator: siteConfig.author,
  publisher: siteConfig.author,
  category: "technology",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <html
      lang="zh-CN"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", manrope.variable)}
    >
      <body className="min-h-svh">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: createWebsiteJsonLdString() }}
        />
        <ThemeProvider>
          <div className="flex min-h-svh flex-col">
            <SiteHeader />
            {children}
            <SiteFooter />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
