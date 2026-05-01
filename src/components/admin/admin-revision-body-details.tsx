"use client"

import * as React from "react"

type RevisionBodyResponse = {
  content?: string
}

type AdminRevisionBodyDetailsProps = {
  contentUrl: string
}

function AdminRevisionBodyDetails({ contentUrl }: AdminRevisionBodyDetailsProps) {
  const [content, setContent] = React.useState<string | null>(null)
  const [status, setStatus] = React.useState<"idle" | "loading" | "ready" | "error">("idle")

  const loadContent = React.useCallback(async () => {
    if (status === "loading" || content !== null) {
      return
    }

    setStatus("loading")

    try {
      const response = await fetch(contentUrl, {
        headers: {
          accept: "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("REVISION_BODY_UNAVAILABLE")
      }

      const data = (await response.json()) as RevisionBodyResponse
      setContent(data.content ?? "")
      setStatus("ready")
    } catch {
      setStatus("error")
    }
  }, [content, contentUrl, status])

  return (
    <details
      className="mt-4 rounded-2xl border border-[#333333] bg-[#111111] px-4 py-3"
      onToggle={(event) => {
        if (event.currentTarget.open) {
          void loadContent()
        }
      }}
    >
      <summary className="cursor-pointer text-sm font-medium text-[#d1d5db]">查看此版本正文</summary>
      {status === "loading" ? (
        <p className="admin-copy mt-4">正在读取版本正文...</p>
      ) : null}
      {status === "error" ? (
        <p className="mt-4 text-sm text-[#ff8d82]">版本正文读取失败，请稍后重试。</p>
      ) : null}
      {status === "ready" ? (
        <pre className="mt-4 overflow-x-auto whitespace-pre-wrap font-mono text-sm leading-7 text-[#8c8c8c]">
          {content}
        </pre>
      ) : null}
    </details>
  )
}

export { AdminRevisionBodyDetails }
