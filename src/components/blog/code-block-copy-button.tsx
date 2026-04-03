"use client"

import * as React from "react"
import { Check, Copy } from "lucide-react"

import { Button } from "@/components/ui/button"

type CodeBlockCopyButtonProps = {
  code: string
}

function CodeBlockCopyButton({ code }: CodeBlockCopyButtonProps) {
  const [copied, setCopied] = React.useState(false)

  React.useEffect(() => {
    if (!copied) {
      return
    }

    const timer = window.setTimeout(() => {
      setCopied(false)
    }, 2000)

    return () => {
      window.clearTimeout(timer)
    }
  }, [copied])

  async function handleCopy() {
    await navigator.clipboard.writeText(code)
    setCopied(true)
  }

  return (
    <Button
      type="button"
      size="sm"
      variant="ghost"
      aria-label={copied ? "代码已复制" : "复制代码"}
      className="code-block-copy-button h-8 rounded-full border px-3"
      onClick={() => {
        void handleCopy()
      }}
    >
      {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
      <span>{copied ? "已复制" : "复制"}</span>
    </Button>
  )
}

export { CodeBlockCopyButton }
