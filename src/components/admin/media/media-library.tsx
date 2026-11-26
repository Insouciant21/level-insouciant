import { useCallback, useEffect, useMemo, useState } from "react"
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  ChevronLeft,
  ChevronRight,
  Images,
  RefreshCw,
  Search,
} from "lucide-react"

import { fetchMediaAssets } from "@/components/admin/media/media-api"
import { MediaAssetCard } from "@/components/admin/media/media-asset-card"
import { MediaAssetDetailsPanel } from "@/components/admin/media/media-asset-details"
import { MediaUploadQueue } from "@/components/admin/media/media-upload-queue"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type {
  MediaAssetDetails,
  MediaAssetSummary,
  MediaListResult,
  MediaListStatus,
} from "@/lib/media/assets"

type MediaLibraryProps = {
  initialData: MediaListResult
}

const SEARCH_DEBOUNCE_MS = 250
const PRIORITY_THUMBNAIL_COUNT = 6

function MediaLibrary({ initialData }: MediaLibraryProps) {
  const queryClient = useQueryClient()
  const [initialLoadedAt] = useState(() => Date.now())
  const [searchInput, setSearchInput] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [status, setStatus] = useState<MediaListStatus>("all")
  const [page, setPage] = useState(initialData.page)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    const trimmed = searchInput.trim()

    if (!trimmed) {
      if (debouncedQuery !== "") {
        setDebouncedQuery("")
        setPage(1)
      }
      return
    }

    if (trimmed === debouncedQuery) {
      return
    }

    const timer = window.setTimeout(() => {
      setDebouncedQuery(trimmed)
      setPage(1)
    }, SEARCH_DEBOUNCE_MS)

    return () => window.clearTimeout(timer)
  }, [debouncedQuery, searchInput])

  const queryKey = useMemo(
    () =>
      [
        "admin-media-list",
        {
          query: debouncedQuery,
          status,
          page,
          pageSize: initialData.pageSize,
        },
      ] as const,
    [debouncedQuery, initialData.pageSize, page, status]
  )

  const isInitialDefaultQuery =
    debouncedQuery === "" && status === "all" && page === initialData.page

  const listQuery = useQuery<MediaListResult>({
    queryKey,
    queryFn: ({ signal }) =>
      fetchMediaAssets(
        {
          query: debouncedQuery,
          status,
          page,
          pageSize: initialData.pageSize,
        },
        { signal }
      ),
    initialData: isInitialDefaultQuery ? initialData : undefined,
    initialDataUpdatedAt: isInitialDefaultQuery ? initialLoadedAt : undefined,
    placeholderData: keepPreviousData,
  })

  const data = listQuery.data ?? initialData
  const isLoading = listQuery.isFetching
  const error =
    listQuery.error instanceof Error
      ? listQuery.error.message
      : listQuery.isError
        ? "媒体库加载失败"
        : null

  const selectedSummary = useMemo(
    () =>
      selectedId
        ? data.items.find((item) => item.id === selectedId)
        : undefined,
    [data.items, selectedId]
  )

  const handleStatusChange = useCallback((nextStatus: MediaListStatus) => {
    setStatus(nextStatus)
    setPage(1)
  }, [])

  const handleUploaded = useCallback(
    (asset: MediaAssetSummary) => {
      if (debouncedQuery === "" && status !== "linked" && page === 1) {
        queryClient.setQueryData<MediaListResult>(queryKey, (current) => {
          const base = current ?? initialData
          const nextTotal = base.total + 1

          return {
            ...base,
            items: [
              asset,
              ...base.items.filter((item) => item.id !== asset.id),
            ].slice(0, base.pageSize),
            total: nextTotal,
            totalPages: Math.max(1, Math.ceil(nextTotal / base.pageSize)),
          }
        })
      }
    },
    [debouncedQuery, initialData, page, queryClient, queryKey, status]
  )

  const handleQueueSettled = useCallback(() => {
    if (debouncedQuery !== "" || status === "linked" || page !== 1) {
      setPage(1)
      void queryClient.invalidateQueries({ queryKey: ["admin-media-list"] })
      return
    }

    void queryClient.invalidateQueries({
      queryKey: ["admin-media-list"],
      refetchType: "none",
    })
  }, [debouncedQuery, page, queryClient, status])

  const handleOpenAsset = useCallback((asset: MediaAssetSummary) => {
    setSelectedId(asset.id)
  }, [])

  const handleAssetChanged = useCallback(
    (updatedAsset?: MediaAssetSummary) => {
      if (updatedAsset) {
        queryClient.setQueryData<MediaListResult>(queryKey, (current) => {
          if (!current) {
            return current
          }

          return {
            ...current,
            items: current.items.map((item) =>
              item.id === updatedAsset.id ? updatedAsset : item
            ),
          }
        })
        queryClient.setQueryData<MediaAssetDetails>(
          ["admin-media-details", updatedAsset.id],
          (current) => (current ? { ...current, ...updatedAsset } : current)
        )
        void queryClient.invalidateQueries({
          queryKey: ["admin-media-list"],
          refetchType: "none",
        })
        return
      }

      void queryClient.invalidateQueries({ queryKey: ["admin-media-list"] })
    },
    [queryClient, queryKey]
  )

  const handleAssetDeleted = useCallback(
    (assetId: string) => {
      setSelectedId((current) => (current === assetId ? null : current))
      queryClient.removeQueries({
        queryKey: ["admin-media-details", assetId],
        exact: true,
      })

      const currentItemsCount = data.items.length
      if (currentItemsCount <= 1 && page > 1) {
        setPage((current) => Math.max(1, current - 1))
      } else {
        queryClient.setQueryData<MediaListResult>(queryKey, (current) => {
          if (!current) {
            return current
          }

          const nextTotal = Math.max(0, current.total - 1)
          return {
            ...current,
            items: current.items.filter((item) => item.id !== assetId),
            total: nextTotal,
            totalPages: Math.max(1, Math.ceil(nextTotal / current.pageSize)),
          }
        })
      }

      void queryClient.invalidateQueries({ queryKey: ["admin-media-list"] })
    },
    [data.items.length, page, queryClient, queryKey]
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
            <Images
              className="size-4 text-[var(--safety-exit-green-strong)]"
              aria-hidden="true"
            />
            共 {data.total} 个媒体资源
          </div>
        </div>

        <div className="mt-6 grid gap-3 lg:grid-cols-[minmax(0,1fr)_12rem_auto]">
          <label className="relative block">
            <span className="sr-only">搜索媒体</span>
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#748073]"
              aria-hidden="true"
            />
            <Input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="按显示名称搜索…"
              aria-label="搜索媒体"
              className="admin-input pl-9"
            />
          </label>
          <label>
            <span className="sr-only">关联状态</span>
            <select
              value={status}
              onChange={(event) =>
                handleStatusChange(event.target.value as MediaListStatus)
              }
              aria-label="关联状态"
              className="admin-input h-10 w-full"
            >
              <option value="all">全部资源</option>
              <option value="linked">已关联</option>
              <option value="unlinked">未关联</option>
            </select>
          </label>
          <Button
            type="button"
            variant="outline"
            onClick={() => void listQuery.refetch()}
            disabled={isLoading}
          >
            <RefreshCw
              className={isLoading ? "size-4 animate-spin" : "size-4"}
              aria-hidden="true"
            />
            刷新
          </Button>
        </div>
      </div>

      <MediaUploadQueue
        onUploaded={handleUploaded}
        onQueueSettled={handleQueueSettled}
      />

      {error ? (
        <div className="border border-[var(--admin-danger)]/30 bg-[var(--admin-danger)]/10 px-4 py-3 text-sm text-[var(--admin-danger)]">
          {error}
        </div>
      ) : null}

      <div
        className={
          selectedId ? "grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]" : "block"
        }
      >
        <div>
          {data.items.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
              {data.items.map((asset, index) => (
                <MediaAssetCard
                  key={asset.id}
                  asset={asset}
                  priority={index < PRIORITY_THUMBNAIL_COUNT}
                  onOpen={handleOpenAsset}
                  onChanged={handleAssetChanged}
                  onDeleted={handleAssetDeleted}
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
                  onClick={() =>
                    setPage((current) => Math.max(1, current - 1))
                  }
                >
                  <ChevronLeft className="size-3.5" aria-hidden="true" />
                  上一页
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={data.page >= data.totalPages || isLoading}
                  onClick={() =>
                    setPage((current) => Math.min(data.totalPages, current + 1))
                  }
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
            initialSummary={selectedSummary}
            onClose={() => setSelectedId(null)}
          />
        ) : null}
      </div>
    </section>
  )
}

export { MediaLibrary }
