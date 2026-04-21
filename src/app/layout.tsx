import type { Metadata } from "next"
import type { ReactNode } from "react"
import { Barlow_Condensed, Cormorant_Garamond, IBM_Plex_Mono } from "next/font/google"

import "katex/dist/katex.min.css"
import "./globals.css"
import { SiteFrame } from "@/components/blog/site-frame"
import { SiteFooter } from "@/components/blog/site-footer"
import { SiteHeader } from "@/components/blog/site-header"
import { createPageMetadata, createWebsiteJsonLdString } from "@/lib/seo"
import { siteConfig } from "@/lib/site"
import { cn } from "@/lib/utils"

const fontSans = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
})

const fontSerif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-serif",
})

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
      className={cn(
        "antialiased",
        fontSans.variable,
        fontSerif.variable,
        fontMono.variable,
        "font-sans"
      )}
    >
      <body className="min-h-svh">
        {process.env.NODE_ENV === "development" ? (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function () {
                  if (typeof window === "undefined" || !window.performance || typeof window.performance.measure !== "function") {
                    return;
                  }

                  if (window.__insousMeasureGuardInstalled) {
                    return;
                  }

                  window.__insousMeasureGuardInstalled = true;

                  var originalMeasure = window.performance.measure.bind(window.performance);

                  window.performance.measure = function () {
                    try {
                      return originalMeasure.apply(this, arguments);
                    } catch (error) {
                      if (error instanceof TypeError && /cannot have a negative time stamp/.test(error.message)) {
                        return;
                      }

                      throw error;
                    }
                  };
                })();
              `,
            }}
          />
        ) : null}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: createWebsiteJsonLdString() }}
        />
        <SiteFrame header={<SiteHeader />} footer={<SiteFooter />}>
          {children}
        </SiteFrame>
      </body>
    </html>
  )
}
