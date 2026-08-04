"use client"

import * as React from "react"
import CodeMirror, { EditorView } from "@uiw/react-codemirror"
import { markdown } from "@codemirror/lang-markdown"
import PerfectScrollbarPrimitive from "perfect-scrollbar"

import { createPerfectScrollbarController } from "@/lib/perfect-scrollbar"
import { cn } from "@/lib/utils"

type MdxEditorProps = {
  value: string
  onChange: (value: string) => void
  id?: string
  ariaLabel?: string
  className?: string
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
}: MdxEditorProps) {
  const extensions = React.useMemo(
    () => [markdown(), EditorView.lineWrapping],
    []
  )
  const perfectScrollbarRef = React.useRef<ReturnType<
    typeof createPerfectScrollbarController
  > | null>(null)
  const perfectScrollbarElementRef = React.useRef<HTMLElement | null>(null)

  const handleCreateEditor = React.useCallback(
    (view: { scrollDOM: HTMLElement }) => {
      perfectScrollbarRef.current?.destroy()

      const scrollElement = view.scrollDOM
      scrollElement.classList.add("perfect-scrollbar")
      perfectScrollbarElementRef.current = scrollElement

      perfectScrollbarRef.current = createPerfectScrollbarController(
        scrollElement,
        PerfectScrollbarPrimitive
      )
      perfectScrollbarRef.current.update()
    },
    []
  )

  React.useEffect(() => {
    return () => {
      perfectScrollbarRef.current?.destroy()
      perfectScrollbarRef.current = null

      const scrollElement = perfectScrollbarElementRef.current
      scrollElement?.classList.remove("perfect-scrollbar")
      perfectScrollbarElementRef.current = null

    }
  }, [])

  React.useEffect(() => {
    perfectScrollbarRef.current?.update()
  }, [value])

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
        onCreateEditor={handleCreateEditor}
        onChange={onChange}
      />
    </div>
  )
}

export { MdxEditor }
