import type { ComponentPropsWithoutRef, ReactNode } from "react"
import { compile, run } from "@mdx-js/mdx"
import * as runtime from "react/jsx-runtime"
import { createHash } from "node:crypto"
import { renderToStaticMarkup } from "react-dom/server"
import rehypeKatex from "rehype-katex"
import rehypePrettyCode from "rehype-pretty-code"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"

import { CodeBlockFigure } from "@/components/blog/code-block-figure"
import { normalizeMdxSource } from "@/lib/mdx"
import { createHeadingIdFactory, extractTableOfContents } from "@/lib/toc"
import { cn } from "@/lib/utils"

type HeadingLevel = 2 | 3

function getPlainText(children: ReactNode): string {
  if (typeof children === "string" || typeof children === "number") {
    return String(children)
  }

  if (Array.isArray(children)) {
    return children.map(getPlainText).join("")
  }

  if (children && typeof children === "object" && "props" in children) {
    return getPlainText(
      (children as { props?: { children?: ReactNode } }).props?.children ?? ""
    )
  }

  return ""
}

function createHeadingRenderer(
  getId: (value: string) => string,
  level: HeadingLevel
) {
  const Tag = `h${level}` as const

  return function Heading(props: ComponentPropsWithoutRef<typeof Tag>) {
    const text = getPlainText(props.children)
    const id = getId(text)

    return (
      <Tag {...props} id={id} className={cn("scroll-mt-28", props.className)}>
        {props.children}
      </Tag>
    )
  }
}

// Cache trusted author content only, never authenticated page HTML.
const compiled = new Map<string, string>()
let compiledBytes = 0
const rendered = new Map<string, string>()
let renderedBytes = 0
const MAX_CACHE_BYTES = 16 * 1024 * 1024

function sourceKey(source: string) {
  return createHash("sha256").update(source).digest("hex")
}

async function compileSource(source: string) {
  const key = createHash("sha256")
    .update("mdx3-gfm-math-pretty-v2\0" + source)
    .digest("hex")
  const cached = compiled.get(key)
  if (cached !== undefined) return cached
  const code = String(
    await compile(normalizeMdxSource(source), {
      outputFormat: "function-body",
      remarkPlugins: [remarkGfm, [remarkMath, { singleDollarTextMath: true }]],
      rehypePlugins: [
        rehypeKatex,
        [
          rehypePrettyCode,
          {
            theme: "github-light",
            keepBackground: false,
            defaultLang: { block: "text", inline: "text" },
          },
        ],
      ],
    })
  )
  const bytes = Buffer.byteLength(code)
  if (bytes <= MAX_CACHE_BYTES && !compiled.has(key)) {
    while (compiled.size >= 64 || compiledBytes + bytes > MAX_CACHE_BYTES) {
      const oldest = compiled.keys().next().value!
      compiledBytes -= Buffer.byteLength(compiled.get(oldest)!)
      compiled.delete(oldest)
    }
    compiled.set(key, code)
    compiledBytes += bytes
  }
  return code
}
export async function renderMdx(source: string) {
  const key = sourceKey(source)
  const cachedHtml = rendered.get(key)
  if (cachedHtml !== undefined) {
    rendered.delete(key)
    rendered.set(key, cachedHtml)
    return cachedHtml
  }

  const { default: Content } = await run(await compileSource(source), {
    ...runtime,
    baseUrl: import.meta.url,
  })
  const headings = extractTableOfContents(source)
  const fallbackId = createHeadingIdFactory()
  let headingIndex = 0
  const getId = (text: string) =>
    headings[headingIndex++]?.id ?? fallbackId(text)
  const html = renderToStaticMarkup(
    <div className="prose-block min-w-0">
      <Content
        components={{
          figure: CodeBlockFigure,
          h2: createHeadingRenderer(getId, 2),
          h3: createHeadingRenderer(getId, 3),
        }}
      />
    </div>
  )

  const bytes = Buffer.byteLength(html)
  if (bytes <= MAX_CACHE_BYTES && !rendered.has(key)) {
    while (rendered.size >= 64 || renderedBytes + bytes > MAX_CACHE_BYTES) {
      const oldest = rendered.keys().next().value!
      renderedBytes -= Buffer.byteLength(rendered.get(oldest)!)
      rendered.delete(oldest)
    }
    rendered.set(key, html)
    renderedBytes += bytes
  }

  return html
}
