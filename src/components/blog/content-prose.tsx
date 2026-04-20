import type { ComponentPropsWithoutRef, ReactNode } from "react"
import { MDXRemote } from "next-mdx-remote/rsc"
import rehypeKatex from "rehype-katex"
import rehypePrettyCode from "rehype-pretty-code"
import remarkMath from "remark-math"

import { CodeBlockFigure } from "@/components/blog/code-block-figure"
import { normalizeMdxSource } from "@/lib/mdx"
import { createHeadingIdFactory } from "@/lib/toc"
import { cn } from "@/lib/utils"

type ContentProseProps = {
  source: string
}

type HeadingLevel = 2 | 3

function getPlainText(children: ReactNode): string {
  if (typeof children === "string" || typeof children === "number") {
    return String(children)
  }

  if (Array.isArray(children)) {
    return children.map(getPlainText).join("")
  }

  if (children && typeof children === "object" && "props" in children) {
    return getPlainText((children as { props?: { children?: ReactNode } }).props?.children ?? "")
  }

  return ""
}

function createHeadingRenderer(getId: (value: string) => string, level: HeadingLevel) {
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

function ContentProse({ source }: ContentProseProps) {
  const getId = createHeadingIdFactory()
  const normalizedSource = normalizeMdxSource(source)

  return (
    <div className="prose-block">
      <MDXRemote
        source={normalizedSource}
        options={{
          mdxOptions: {
            remarkPlugins: [[remarkMath, { singleDollarTextMath: true }]],
            rehypePlugins: [
              [rehypeKatex],
              [
                rehypePrettyCode,
                {
                  theme: "github-light",
                  keepBackground: false,
                  defaultLang: {
                    block: "text",
                    inline: "text",
                  },
                },
              ],
            ],
          },
        }}
        components={{
          figure: CodeBlockFigure,
          h2: createHeadingRenderer(getId, 2),
          h3: createHeadingRenderer(getId, 3),
        }}
      />
    </div>
  )
}

export { ContentProse }
