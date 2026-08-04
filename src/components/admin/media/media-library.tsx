"use client"

import { useCallback, useState } from "react"
import { ChevronLeft, ChevronRight, Images, RefreshCw, Search } from "lucide-react"

import {
  fetchMediaAssets,
} from "@/components/admin/media/media-api"
import { MediaAssetCard } from "@/components/admin/media/media-asset-card"
import { MediaAssetDetailsPanel } from "@/components/admin/media/media-asset-details"
import { MediaUploadQueue } from "@/components/admin/media/media-upload-queue"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type {
  MediaListResult,
  MediaListStatus,
} from "@/lib/media/assets"

type MediaLibraryProps = {
  initialData: MediaListResult
}

function MediaLibrary({ initialData }: MediaLibraryProps) {
  const [data, setData] = useState(initialData)
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState<MediaListStatus>("all")
  const [page, setPage] = useState(initialData.page)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(
    async (
      nextPage = page,
      nextQuery = query,
      nextStatus = status
    ) => {
      setIsLoading(true)
      setError(null)

      try {
        const result = await fetchMediaAssets({
          query: nextQuery,
          status: nextStatus,
          page: nextPage,
          pageSize: initialData.pageSize,
        })
        setData(result)
        setPage(result.page)
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : "媒体库加载失败")
      } finally {
        setIsLoading(false)
      }
    },
    [initialData.pageSize, page, query, status]
  )

  const handleFilterChange = useCallback(
    (nextQuery: string, nextStatus: MediaListStatus = status) => {
      setQuery(nextQuery)
      setStatus(nextStatus)
      setPage(1)
      void reload(1, nextQuery, nextStatus)
    },
    [reload, status]
  )

  const handleUploaded = useCallback(() => {
    void reload(1)
  }, [reload])

  const handleAssetChanged = useCallback(() => {
    void reload()
  }, [reload])

  const handleAssetDeleted = useCallback(
    (assetId: string) => {
      if (selectedId === assetId) {
        setSelectedId(null)
      }
      void reload()
    },
    [reload, selectedId]
  )

  return (
    <section className="grid gap-6">
      <div className="admin-surface p-4 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="admin-kicker-accent">Object Storage Relay</p>
            <h1 className="admin-title mt-2">媒体库</h1>
            <p className="admin-copy mt-2 max-w-2xl">
              管理原图、查看文章关联，并从统一入口上传到当前对象存储供应商。
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#748073]">
            <Images className="size-4 text-[var(--safety-exit-green-strong)]" aria-hidden="true" />
            共 {data.total} 个媒体资源
          </div>
        </div>

        <div className="mt-6 grid gap-3 lg:grid-cols-[minmax(0,1fr)_12rem_auto]">
          <label className="relative block">
            <span className="sr-only">搜索媒体</span>
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#748073]" aria-hidden="true" />
            <Input
              type="search"
              value={query}
              onChange={(event) => handleFilterChange(event.target.value)}
              placeholder="按显示名称搜索…"
              aria-label="搜索媒体"
              className="admin-input pl-9"
            />
          </label>
          <label>
            <span className="sr-only">关联状态</span>
            <select
              value={status}
              onChange={(event) => handleFilterChange(query, event.target.value as MediaListStatus)}
              aria-label="关联状态"
              className="admin-input h-10 w-full"
            >
              <option value="all">全部资源</option>
              <option value="linked">已关联</option>
              <option value="unlinked">未关联</option>
            </select>
          </label>
          <Button type="button" variant="outline" onClick={() => void reload()} disabled={isLoading}>
            <RefreshCw className={isLoading ? "size-4 animate-spin" : "size-4"} aria-hidden="true" />
            刷新
          </Button>
        </div>
      </div>

      <MediaUploadQueue onUploaded={handleUploaded} />

      {error ? (
        <div className="border border-[var(--admin-danger)]/30 bg-[var(--admin-danger)]/10 px-4 py-3 text-sm text-[var(--admin-danger)]">
          {error}
        </div>
      ) : null}

      <div className={selectedId ? "grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]" : "block"}>
        <div>
          {data.items.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
              {data.items.map((asset) => (
                <MediaAssetCard
                  key={asset.id}
                  asset={asset}
                  onOpen={() => setSelectedId(asset.id)}
                  onChanged={handleAssetChanged}
                  onDeleted={() => handleAssetDeleted(asset.id)}
                />
              ))}
            </div>
          ) : (
            <div className="admin-empty">
              {isLoading ? "正在读取媒体记录…" : "还没有符合条件的媒体资源。"}
            </div>
          )}

          {data.totalPages > 1 ? (
            <div className="mt-5 flex items-center justify-between gap-3 border-t border-white/10 pt-4">
              <p className="text-xs text-[#748073]">
                第 {data.page} / {data.totalPages} 页
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={data.page <= 1 || isLoading}
                  onClick={() => {
                    const nextPage = Math.max(1, data.page - 1)
                    setPage(nextPage)
                    void reload(nextPage)
                  }}
                >
                  <ChevronLeft className="size-3.5" aria-hidden="true" />
                  上一页
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={data.page >= data.totalPages || isLoading}
                  onClick={() => {
                    const nextPage = Math.min(data.totalPages, data.page + 1)
                    setPage(nextPage)
                    void reload(nextPage)
                  }}
                >
                  下一页
                  <ChevronRight className="size-3.5" aria-hidden="true" />
                </Button>
              </div>
            </div>
          ) : null}
        </div>

        {selectedId ? (
          <MediaAssetDetailsPanel
            key={selectedId}
            assetId={selectedId}
            onClose={() => setSelectedId(null)}
          />
        ) : null}
      </div>
    </section>
  )
}

export { MediaLibrary }
