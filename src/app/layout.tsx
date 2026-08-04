import type { Metadata } from "next"
import type { ReactNode } from "react"
import {
  Barlow_Condensed,
  Cormorant_Garamond,
  IBM_Plex_Mono,
} from "next/font/google"

import "katex/dist/katex.min.css"
import "./globals.css"
import { SiteFrame } from "@/components/blog/site-frame"
import { SiteFooter } from "@/components/blog/site-footer"
import { SiteHeader } from "@/components/blog/site-header"
import { QueryProvider } from "@/components/providers/query-provider"
import { MessageProvider } from "@/components/ui/message-provider"
import { createPageMetadata, createWebsiteJsonLdString } from "@/lib/seo"
import { getSiteConfig } from "@/lib/site-config"
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

export async function generateMetadata(): Promise<Metadata> {
  const siteConfig = await getSiteConfig()

  return {
    ...createPageMetadata(
      {
        title: siteConfig.name,
        description: siteConfig.description,
        path: "/",
      },
      siteConfig
    ),
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
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  const siteConfig = await getSiteConfig()

  return (
    <html
      lang={siteConfig.language}
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

                  if (window.__levelInsouciantMeasureGuardInstalled) {
                    return;
                  }

                  window.__levelInsouciantMeasureGuardInstalled = true;

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
          dangerouslySetInnerHTML={{
            __html: createWebsiteJsonLdString(siteConfig),
          }}
        />
        <QueryProvider>
          <MessageProvider>
            <SiteFrame header={<SiteHeader />} footer={<SiteFooter />}>
              {children}
            </SiteFrame>
          </MessageProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
