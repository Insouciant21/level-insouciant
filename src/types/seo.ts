export type Metadata = {
  title?: string | { absolute?: string }
  description?: string
  keywords?: string[]
  alternates?: { canonical?: string }
  robots?: { index?: boolean; follow?: boolean }
  openGraph?: {
    type?: string
    url?: string
    title?: string
    description?: string
    siteName?: string
    locale?: string
    images?: { url: string; alt?: string }[]
    publishedTime?: string
    modifiedTime?: string
    tags?: string[]
  }
  twitter?: {
    card?: string
    title?: string
    description?: string
    images?: string[]
  }
}
