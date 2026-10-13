"use client"

import { useState } from "react"
import { ImagePlus, LoaderCircle, Search, X } from "lucide-react"

import { fetchMediaAssets } from "@/components/admin/media/media-api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { MediaAssetSummary } from "@/lib/media/assets"

type MediaPickerProps = {
  onSelect: (asset: MediaAssetSummary) => void
  buttonLabel?: string
  className?: string
}

function MediaPicker({
  onSelect,
  buttonLabel = "从媒体库选择",
  className,
}: MediaPickerProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [items, setItems] = useState<MediaAssetSummary[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function loadItems(nextQuery = query) {
    setIsLoading(true)
    setError(null)

    try {
      const result = await fetchMediaAssets({
        query: nextQuery,
        status: "all",
        page: 1,
        pageSize: 12,
      })
      setItems(result.items)
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "媒体读取失败")
    } finally {
      setIsLoading(false)
    }
  }

  function openPicker() {
    setOpen(true)
    void loadItems("")
  }

  function closePicker() {
    setOpen(false)
  }

  return (
    <div className={className}>
      <Button type="button" variant="outline" size="sm" onClick={openPicker}>
        <ImagePlus className="size-3.5" aria-hidden="true" />
        {buttonLabel}
      </Button>

      {open ? (
        <div className="mt-3 border border-white/10 bg-[#10130f] p-3" role="dialog" aria-label="选择媒体">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-[#edf3e9]">选择媒体</p>
            <Button type="button" variant="ghost" size="icon-xs" onClick={closePicker} aria-label="关闭媒体选择器">
              <X className="size-3.5" />
            </Button>
          </div>
          <div className="relative mt-3">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-[#748073]" aria-hidden="true" />
            <Input
              type="search"
              value={query}
              onChange={(event) => {
                const nextQuery = event.target.value
                setQuery(nextQuery)
                void loadItems(nextQuery)
              }}
              placeholder="搜索显示名称…"
              aria-label="搜索媒体资源"
              className="admin-input h-9 pl-8 text-xs"
            />
          </div>
          {error ? <p className="mt-3 text-xs text-[var(--admin-danger)]">{error}</p> : null}
          {isLoading ? (
            <div className="flex items-center gap-2 py-6 text-xs text-[#9aa79a]">
              <LoaderCircle className="size-3.5 animate-spin" /> 正在读取…
            </div>
          ) : items.length > 0 ? (
            <div className="mt-3 grid max-h-72 grid-cols-3 gap-2 overflow-y-auto">
              {items.map((asset) => (
                <button
                  key={asset.id}
                  type="button"
                  className="group overflow-hidden border border-white/10 text-left transition hover:border-[var(--safety-exit-green)]/60"
                  onClick={() => {
                    onSelect(asset)
                    closePicker()
                  }}
                  aria-label={`选择媒体 ${asset.displayName}`}
                >
                  <div className="aspect-square bg-black/20">
                    <img src={asset.publicUrl} alt="" className="size-full object-cover transition group-hover:scale-105" />
                  </div>
                  <span className="block truncate px-2 py-1.5 text-[0.68rem] text-[#c6d2c1]">{asset.displayName}</span>
                </button>
              ))}
            </div>
          ) : (
            <p className="py-6 text-center text-xs text-[#748073]">没有可选择的媒体。</p>
          )}
        </div>
      ) : null}
    </div>
  )
}

export { MediaPicker }
