"use client"

import { useState } from "react"
import { Copy, FilePenLine, LoaderCircle, Trash2 } from "lucide-react"

import {
  deleteMediaAsset,
  renameMediaAsset,
  retryMediaAssetDeletion,
} from "@/components/admin/media/media-api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { MediaAssetSummary } from "@/lib/media/assets"

type MediaAssetCardProps = {
  asset: MediaAssetSummary
  onOpen: () => void
  onChanged: () => void
  onDeleted: () => void
}

function MediaAssetCard({
  asset,
  onOpen,
  onChanged,
  onDeleted,
}: MediaAssetCardProps) {
  const [isRenaming, setIsRenaming] = useState(false)
  const [displayName, setDisplayName] = useState(asset.displayName)
  const [isBusy, setIsBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleRename() {
    if (!displayName.trim()) {
      setError("名称不能为空")
      return
    }

    setIsBusy(true)
    setError(null)

    try {
      await renameMediaAsset(asset.id, displayName)
      setIsRenaming(false)
      onChanged()
    } catch (renameError) {
      setError(renameError instanceof Error ? renameError.message : "改名失败")
    } finally {
      setIsBusy(false)
    }
  }

  async function handleDelete(retry = false) {
    if (
      !retry &&
      !window.confirm(
        asset.linkedArticleCount > 0
          ? `该图片已关联 ${asset.linkedArticleCount} 篇文章，删除后会从文章正文和封面中移除引用。确定继续吗？`
          : "该图片尚未关联文章，确定从对象存储和媒体库中删除吗？"
      )
    ) {
      return
    }

    setIsBusy(true)
    setError(null)

    try {
      const result = retry
        ? await retryMediaAssetDeletion(asset.id)
        : await deleteMediaAsset(asset.id)

      if (result.status === "DELETE_FAILED") {
        setError("对象存储删除失败，可稍后重试。")
        onChanged()
      } else {
        onDeleted()
      }
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "删除失败")
    } finally {
      setIsBusy(false)
    }
  }

  async function copyPublicUrl() {
    try {
      await navigator.clipboard.writeText(asset.publicUrl)
      setError("公开 URL 已复制")
    } catch {
      setError("复制失败，请手动复制详情中的 URL")
    }
  }

  return (
    <article className="admin-surface-muted overflow-hidden">
      <button
        type="button"
        className="group block w-full text-left"
        onClick={onOpen}
        aria-label={`查看媒体详情 ${asset.displayName}`}
      >
        <div className="aspect-[16/10] overflow-hidden bg-black/20">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={asset.publicUrl}
            alt={asset.displayName}
            className="size-full object-cover transition duration-300 group-hover:scale-[1.03]"
          />
        </div>
      </button>

      <div className="p-4">
        {isRenaming ? (
          <div className="flex gap-2">
            <Input
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              aria-label={`媒体名称 ${asset.displayName}`}
              autoFocus
              className="admin-input h-9"
            />
            <Button type="button" size="sm" onClick={handleRename} disabled={isBusy}>
              保存
            </Button>
          </div>
        ) : (
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="truncate text-sm font-semibold text-[#edf3e9]">
                {asset.displayName}
              </h2>
              <p className="mt-1 text-xs text-[#748073]">
                {asset.mimeType} · {formatSize(asset.sizeBytes)}
              </p>
            </div>
            <span className="admin-status-pill admin-status-live">
              {asset.provider.toUpperCase()}
            </span>
          </div>
        )}

        <p className="mt-3 text-xs text-[#9aa79a]">
          {asset.linkedArticleCount > 0
            ? `已关联 ${asset.linkedArticleCount} 篇文章`
            : "未关联文章"}
        </p>

        {error ? (
          <p className="mt-2 text-xs text-[var(--admin-warning)]">{error}</p>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsRenaming((current) => !current)}
            disabled={isBusy}
          >
            <FilePenLine className="size-3.5" aria-hidden="true" />
            {isRenaming ? "取消" : "改名"}
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={copyPublicUrl}>
            <Copy className="size-3.5" aria-hidden="true" />
            复制 URL
          </Button>
          {asset.status === "DELETE_FAILED" ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void handleDelete(true)}
              disabled={isBusy}
            >
              {isBusy ? <LoaderCircle className="size-3.5 animate-spin" /> : null}
              重试删除
            </Button>
          ) : (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => void handleDelete()}
              disabled={isBusy || asset.status === "DELETING"}
            >
              {isBusy ? <LoaderCircle className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" aria-hidden="true" />}
              删除
            </Button>
          )}
        </div>
      </div>
    </article>
  )
}

function formatSize(sizeBytes: number) {
  if (sizeBytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(sizeBytes / 1024))} KB`
  }

  return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`
}

export { MediaAssetCard }
