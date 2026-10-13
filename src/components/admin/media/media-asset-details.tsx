"use client"

import { useEffect, useState } from "react"
import { Clipboard, ExternalLink, X } from "lucide-react"

import { fetchMediaAssetDetails } from "@/components/admin/media/media-api"
import { Button } from "@/components/ui/button"
import type { MediaAssetDetails } from "@/lib/media/assets"

type MediaAssetDetailsProps = {
  assetId: string
  onClose: () => void
}

function MediaAssetDetailsPanel({
  assetId,
  onClose,
}: MediaAssetDetailsProps) {
  const [details, setDetails] = useState<MediaAssetDetails | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    void fetchMediaAssetDetails(assetId)
      .then((result) => {
        if (active) {
          setDetails(result)
        }
      })
      .catch((fetchError: unknown) => {
        if (active) {
          setError(fetchError instanceof Error ? fetchError.message : "加载详情失败")
        }
      })

    return () => {
      active = false
    }
  }, [assetId])

  async function copyUrl() {
    if (!details) {
      return
    }

    await navigator.clipboard.writeText(details.publicUrl)
  }

  return (
    <aside className="admin-surface sticky top-6 h-fit p-4 sm:p-5" aria-label="媒体详情">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="admin-kicker-accent">Asset Dossier</p>
          <h2 className="mt-2 text-lg font-semibold text-[#edf3e9]">媒体详情</h2>
        </div>
        <Button type="button" variant="ghost" size="icon-xs" onClick={onClose} aria-label="关闭媒体详情">
          <X className="size-4" />
        </Button>
      </div>

      {error ? <p className="mt-5 text-sm text-[var(--admin-danger)]">{error}</p> : null}
      {!details && !error ? <p className="mt-5 text-sm text-[#9aa79a]">正在读取媒体记录…</p> : null}

      {details ? (
        <div className="mt-5 grid gap-4">
          <div className="overflow-hidden border border-white/10 bg-black/20">
            <img src={details.publicUrl} alt={details.displayName} className="max-h-64 w-full object-contain" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#edf3e9]">{details.displayName}</p>
            <p className="mt-1 break-all text-xs leading-5 text-[#748073]">原始文件：{details.originalFilename}</p>
          </div>
          <dl className="grid gap-2 text-xs text-[#9aa79a]">
            <div className="flex justify-between gap-3"><dt>供应商</dt><dd>{details.provider.toUpperCase()}</dd></div>
            <div className="flex justify-between gap-3"><dt>对象 Key</dt><dd className="break-all text-right">{details.objectKey}</dd></div>
            <div className="flex justify-between gap-3"><dt>状态</dt><dd>{details.status}</dd></div>
          </dl>
          <div>
            <p className="admin-kicker">Public URL</p>
            <p className="mt-2 break-all border border-white/10 bg-black/10 p-2.5 text-xs leading-5 text-[#9aa79a]">{details.publicUrl}</p>
            <Button type="button" variant="ghost" size="sm" className="mt-2" onClick={() => void copyUrl()}>
              <Clipboard className="size-3.5" aria-hidden="true" />
              复制公开 URL
            </Button>
          </div>
          <div>
            <div className="flex items-center justify-between gap-3">
              <p className="admin-kicker">关联文章</p>
              <span className="text-xs text-[#9aa79a]">{details.articles.length} 篇</span>
            </div>
            {details.articles.length > 0 ? (
              <ul className="mt-2 grid gap-2">
                {details.articles.map((article) => (
                  <li key={article.id} className="border border-white/10 bg-black/10 p-2.5">
                    <a className="admin-link inline-flex items-center gap-1.5 text-xs" href={`/admin/articles/${article.slug}/edit`}>
                      {article.title}
                      <ExternalLink className="size-3" aria-hidden="true" />
                    </a>
                    <p className="mt-1 text-[0.68rem] text-[#748073]">
                      {article.contentReferenceCount > 0 ? `正文 ${article.contentReferenceCount} 次` : "仅封面引用"}
                      {article.draft ? " · 草稿" : " · 已发布"}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-[#748073]">当前没有关联文章。</p>
            )}
          </div>
        </div>
      ) : null}
    </aside>
  )
}

export { MediaAssetDetailsPanel }
