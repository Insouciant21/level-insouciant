"use client"

import * as React from "react"
import CodeMirror, { EditorView } from "@uiw/react-codemirror"
import { markdown } from "@codemirror/lang-markdown"

import { cn } from "@/lib/utils"

type MdxEditorProps = {
  value: string
  onChange: (value: string) => void
  id?: string
  ariaLabel?: string
  className?: string
  scrollContainerRef?: React.MutableRefObject<HTMLElement | null>
}

const mdxEditorTheme = EditorView.theme(
  {
    "&": {
      backgroundColor: "#10130f",
      color: "#c6d2c1",
    },
    ".cm-content": {
      caretColor: "#62d99a",
      fontFamily: "var(--font-mono)",
      fontSize: "0.875rem",
      lineHeight: "1.75rem",
    },
    ".cm-cursor, .cm-dropCursor": {
      borderLeftColor: "#62d99a",
    },
    ".cm-selectionBackground, .cm-content ::selection": {
      backgroundColor: "rgb(0 155 78 / 20%)",
    },
    ".cm-activeLine": {
      backgroundColor: "rgb(220 235 211 / 5%)",
    },
    ".cm-gutters": {
      backgroundColor: "#10130f",
      borderRight: "1px solid rgb(220 235 211 / 12%)",
      color: "#748073",
      fontFamily: "var(--font-mono)",
      fontSize: "0.875rem",
      lineHeight: "1.75rem",
    },
    ".cm-activeLineGutter": {
      backgroundColor: "rgb(0 155 78 / 12%)",
      color: "#c6d2c1",
    },
  },
  { dark: true }
)

function MdxEditor({
  value,
  onChange,
  id,
  ariaLabel = "MDX editor",
  className,
  scrollContainerRef,
}: MdxEditorProps) {
  const extensions = React.useMemo(() => [markdown()], [])

  React.useEffect(() => {
    return () => {
      if (scrollContainerRef) {
        scrollContainerRef.current = null
      }
    }
  }, [scrollContainerRef])

  return (
    <div
      className={cn(
        "overflow-hidden border border-white/10 bg-[#10130f] text-[#c6d2c1] [&_.cm-editor]:min-h-[32rem] [&_.cm-editor]:bg-[#10130f] [&_.cm-line]:font-mono [&_.cm-line]:leading-7 [&_.cm-scroller]:font-mono [&_.cm-scroller]:text-sm",
        className
      )}
    >
      <CodeMirror
        id={id}
        value={value}
        height="32rem"
        minHeight="32rem"
        extensions={extensions}
        theme={mdxEditorTheme}
        aria-label={ariaLabel}
        onCreateEditor={(view) => {
          if (scrollContainerRef) {
            scrollContainerRef.current = view.scrollDOM
          }
        }}
        onChange={onChange}
      />
    </div>
  )
}

export { MdxEditor }
