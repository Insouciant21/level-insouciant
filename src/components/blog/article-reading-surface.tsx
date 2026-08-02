"use client"

import * as React from "react"
import type { ReactNode } from "react"

import { ReadingProgressBar } from "@/components/blog/reading-progress-bar"
import { cn } from "@/lib/utils"

type ArticleReadingSurfaceProps = {
  children: ReactNode
  className?: string
}

function ArticleReadingSurface({
  children,
  className,
}: ArticleReadingSurfaceProps) {
  const targetRef = React.useRef<HTMLElement>(null)

  return (
    <article
      id="article-reading-root"
      ref={targetRef}
      className={cn("min-w-0", className)}
    >
      <ReadingProgressBar targetRef={targetRef} />
      {children}
    </article>
  )
}

export { ArticleReadingSurface }
