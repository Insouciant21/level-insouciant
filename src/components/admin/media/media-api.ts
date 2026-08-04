import type {
  MediaAssetDetails,
  MediaAssetSummary,
  MediaListQuery,
  MediaListResult,
} from "@/lib/media/assets"

async function parseResponse<T>(response: Response): Promise<T> {
  const payload = (await response.json()) as T | { error?: string }

  if (!response.ok) {
    const errorCode =
      typeof payload === "object" && payload !== null && "error" in payload
        ? payload.error
        : undefined
    throw new Error(errorCode || "MEDIA_REQUEST_FAILED")
  }

  return payload as T
}

export async function fetchMediaAssets(
  query: MediaListQuery = {}
): Promise<MediaListResult> {
  const params = new URLSearchParams()

  if (query.query?.trim()) {
    params.set("query", query.query.trim())
  }

  if (query.status) {
    params.set("status", query.status)
  }

  if (query.page !== undefined) {
    params.set("page", String(query.page))
  }

  if (query.pageSize !== undefined) {
    params.set("pageSize", String(query.pageSize))
  }

  const search = params.toString()
  const response = await fetch(`/api/admin/media${search ? `?${search}` : ""}`, {
    cache: "no-store",
  })

  return parseResponse<MediaListResult>(response)
}

export async function fetchMediaAssetDetails(
  id: string
): Promise<MediaAssetDetails> {
  const response = await fetch(`/api/admin/media/${encodeURIComponent(id)}`, {
    cache: "no-store",
  })

  return parseResponse<MediaAssetDetails>(response)
}

export async function uploadMediaFile(file: File): Promise<MediaAssetSummary> {
  const formData = new FormData()
  formData.set("file", file)
  const response = await fetch("/api/admin/media", {
    method: "POST",
    body: formData,
  })

  return parseResponse<MediaAssetSummary>(response)
}

export async function renameMediaAsset(
  id: string,
  displayName: string
): Promise<MediaAssetSummary> {
  const response = await fetch(`/api/admin/media/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ displayName }),
  })

  return parseResponse<MediaAssetSummary>(response)
}

export async function deleteMediaAsset(
  id: string,
  options?: { retry?: boolean }
): Promise<{ assetId: string; status: string; affectedArticleCount: number }> {
  const retry = options?.retry ? "?retry=1" : ""
  const response = await fetch(
    `/api/admin/media/${encodeURIComponent(id)}${retry}`,
    { method: "DELETE" }
  )

  return parseResponse(response)
}

export async function retryMediaAssetDeletion(id: string) {
  return deleteMediaAsset(id, { retry: true })
}
