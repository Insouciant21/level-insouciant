"use client"

import { useState } from "react"
import { Image as ImageIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export type ArticleImageDialogValue = {
  src: string
  displayName: string
  alt: string
  mode: "insert" | "edit"
  position?: number
}

type ArticleImageDialogProps = {
  value: ArticleImageDialogValue
  onConfirm: (alt: string) => void
  onClose: () => void
}

function ArticleImageDialog({
  value,
  onConfirm,
  onClose,
}: ArticleImageDialogProps) {
  const [alt, setAlt] = useState(value.alt)
  const [error, setError] = useState<string | null>(null)

  function handleConfirm() {
    const normalizedAlt = alt.trim()

    if (!normalizedAlt) {
      setError("请填写图片 alt 文本，帮助读者理解图片内容。")
      return
    }

    onConfirm(normalizedAlt)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" role="dialog" aria-modal="true" aria-label="编辑图片属性">
      <div className="admin-surface w-full max-w-lg p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-[var(--safety-exit-green)]/12 text-[var(--safety-exit-green-strong)]">
            <ImageIcon className="size-4" aria-hidden="true" />
          </span>
          <div>
            <p className="admin-kicker-accent">Image Attribute</p>
            <h2 className="mt-1 text-xl font-semibold text-[#edf3e9]">
              {value.mode === "insert" ? "插入图片" : "编辑图片"}
            </h2>
            <p className="mt-1 text-xs leading-5 text-[#9aa79a]">{value.displayName}</p>
          </div>
        </div>
        <div className="mt-5 overflow-hidden border border-white/10 bg-black/20">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value.src} alt="" className="max-h-56 w-full object-contain" />
        </div>
        <div className="mt-5 grid gap-2">
          <label htmlFor="article-image-alt" className="text-sm font-semibold text-[#dce6d8]">
            Alt 文本 <span className="text-[var(--admin-danger)]">*</span>
          </label>
          <Input
            id="article-image-alt"
            value={alt}
            onChange={(event) => {
              setAlt(event.target.value)
              setError(null)
            }}
            placeholder="描述图片内容"
            autoFocus
            className="admin-input"
          />
          {error ? <p className="text-xs text-[var(--admin-danger)]">{error}</p> : null}
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>取消</Button>
          <Button type="button" onClick={handleConfirm}>插入图片</Button>
        </div>
      </div>
    </div>
  )
}

export { ArticleImageDialog }
