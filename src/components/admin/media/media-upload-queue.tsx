"use client"

import {
  useCallback,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type ClipboardEvent,
} from "react"
import { Check, ImagePlus, LoaderCircle, RotateCcw, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { uploadMediaFile } from "@/components/admin/media/media-api"
import type { MediaAssetSummary } from "@/lib/media/assets"

type QueueStatus = "pending" | "uploading" | "success" | "error"

type QueueItem = {
  id: string
  file: File
  status: QueueStatus
  asset?: MediaAssetSummary
  error?: string
}

type MediaUploadQueueProps = {
  onUploaded: (asset: MediaAssetSummary) => void
}

const acceptedTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
])

function formatFileSize(size: number) {
  if (size < 1024 * 1024) {
    return `${Math.max(1, Math.round(size / 1024))} KB`
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

function getFilesFromDataTransfer(dataTransfer: DataTransfer | null) {
  return dataTransfer ? [...dataTransfer.files] : []
}

function createQueueItem(file: File): QueueItem {
  const randomId =
    typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`

  return {
    id: `${file.name}-${file.lastModified}-${randomId}`,
    file,
    status: "pending",
  }
}

function MediaUploadQueue({ onUploaded }: MediaUploadQueueProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const processingRef = useRef(false)
  const pendingRef = useRef<QueueItem[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [queue, setQueue] = useState<QueueItem[]>([])

  const processQueue = useCallback(async () => {
    if (processingRef.current) {
      return
    }

    processingRef.current = true

    while (pendingRef.current.length > 0) {
      const nextItem = pendingRef.current.shift()

      if (!nextItem) {
        continue
      }

      setQueue((current) =>
        current.map((item) =>
          item.id === nextItem.id ? { ...item, status: "uploading" } : item
        )
      )

      try {
        const asset = await uploadMediaFile(nextItem.file)
        setQueue((current) =>
          current.map((item) =>
            item.id === nextItem.id
              ? { ...item, status: "success", asset }
              : item
          )
        )
        onUploaded(asset)
      } catch (error: unknown) {
        setQueue((current) =>
          current.map((item) =>
            item.id === nextItem.id
              ? {
                  ...item,
                  status: "error",
                  error:
                    error instanceof Error
                      ? error.message
                      : "上传失败",
                }
            : item
          )
        )
      }
    }

    processingRef.current = false
  }, [onUploaded])

  const enqueueFiles = useCallback(
    (files: File[]) => {
      const validFiles = files.filter((file) => acceptedTypes.has(file.type))

      if (validFiles.length === 0) {
        return
      }

      const items = validFiles.map(createQueueItem)
      pendingRef.current.push(...items)
      setQueue((current) => [...current, ...items])
      void processQueue()
    },
    [processQueue]
  )

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    enqueueFiles(event.target.files ? [...event.target.files] : [])
    event.target.value = ""
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setIsDragging(false)
    enqueueFiles(getFilesFromDataTransfer(event.dataTransfer))
  }

  function handlePaste(event: ClipboardEvent<HTMLDivElement>) {
    enqueueFiles(getFilesFromDataTransfer(event.clipboardData))
  }

  function retryItem(item: QueueItem) {
    const pendingItem = { ...item, status: "pending" as const, error: undefined }
    pendingRef.current.push(pendingItem)
    setQueue((current) =>
      current.map((item) =>
        item.id === pendingItem.id ? pendingItem : item
      )
    )
    void processQueue()
  }

  function removeItem(id: string) {
    pendingRef.current = pendingRef.current.filter((item) => item.id !== id)
    setQueue((current) => current.filter((item) => item.id !== id))
  }

  return (
    <section className="admin-surface-muted p-4 sm:p-5">
      <div
        className={`border border-dashed p-5 text-center transition sm:p-6 ${isDragging ? "border-[var(--safety-exit-green)] bg-[var(--safety-exit-green)]/10" : "border-white/20 bg-white/[0.02]"}`}
        onDragEnter={(event) => {
          event.preventDefault()
          setIsDragging(true)
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onPaste={handlePaste}
        tabIndex={0}
        aria-label="图片上传区域"
      >
        <ImagePlus className="mx-auto size-7 text-[var(--safety-exit-green-strong)]" aria-hidden="true" />
        <p className="mt-3 text-sm font-semibold text-[#edf3e9]">
          上传图片到媒体库
        </p>
        <p className="mt-1 text-xs leading-6 text-[#9aa79a]">
          支持选择、拖拽和粘贴；JPG、PNG、WebP、GIF，单张最大 50 MB
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <Button type="button" size="sm" onClick={() => inputRef.current?.click()}>
            选择图片
          </Button>
          <span className="self-center text-xs text-[#748073]">或拖到这里 / Ctrl+V</span>
        </div>
        <input
          ref={inputRef}
          className="sr-only"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          onChange={handleInputChange}
          aria-label="选择图片"
        />
      </div>

      {queue.length > 0 ? (
        <div className="mt-4 grid gap-2" aria-label="上传队列">
          {queue.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 border border-white/10 bg-black/10 px-3 py-2.5"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-[#edf3e9]">{item.file.name}</p>
                <p className="mt-0.5 text-xs text-[#748073]">
                  {formatFileSize(item.file.size)}
                  {item.status === "error" ? ` · ${item.error}` : null}
                </p>
              </div>
              {item.status === "uploading" ? (
                <LoaderCircle className="size-4 animate-spin text-[var(--safety-exit-green)]" aria-label="上传中" />
              ) : item.status === "success" ? (
                <Check className="size-4 text-[var(--safety-exit-green)]" aria-label="上传成功" />
              ) : item.status === "error" ? (
                <Button type="button" variant="ghost" size="icon-xs" onClick={() => retryItem(item)} aria-label={`重试上传 ${item.file.name}`}>
                  <RotateCcw className="size-3.5" />
                </Button>
              ) : null}
              <Button type="button" variant="ghost" size="icon-xs" onClick={() => removeItem(item.id)} aria-label={`移除 ${item.file.name}`}>
                <X className="size-3.5" />
              </Button>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  )
}

export { MediaUploadQueue }
