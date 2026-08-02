"use client"

import * as React from "react"
import CodeMirror from "@uiw/react-codemirror"
import { markdown } from "@codemirror/lang-markdown"

import { cn } from "@/lib/utils"

type MdxEditorProps = {
  value: string
  onChange: (value: string) => void
  id?: string
  ariaLabel?: string
  className?: string
}

function MdxEditor({
  value,
  onChange,
  id,
  ariaLabel = "MDX editor",
  className,
}: MdxEditorProps) {
  const extensions = React.useMemo(() => [markdown()], [])

  return (
    <div
      className={cn(
        "overflow-hidden border border-white/10 bg-[#10130f] text-[#c6d2c1] [&_.cm-editor]:min-h-[32rem] [&_.cm-editor]:bg-[#10130f] [&_.cm-gutters]:border-r-white/10 [&_.cm-gutters]:bg-[#10130f] [&_.cm-line]:font-mono [&_.cm-line]:leading-7 [&_.cm-scroller]:font-mono [&_.cm-scroller]:text-sm [&_.cm-selectionBackground]:bg-[var(--safety-exit-green)]/20",
        className
      )}
    >
      <CodeMirror
        id={id}
        value={value}
        height="32rem"
        minHeight="32rem"
        extensions={extensions}
        theme="none"
        aria-label={ariaLabel}
        onChange={onChange}
      />
    </div>
  )
}

export { MdxEditor }
