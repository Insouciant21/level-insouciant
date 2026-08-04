import type { AcceptedImageMime } from "@/lib/media/types"

export const MAX_MEDIA_FILE_SIZE = 50 * 1024 * 1024

const MIME_EXTENSIONS: Record<AcceptedImageMime, readonly string[]> = {
  "image/jpeg": ["jpg", "jpeg"],
  "image/png": ["png"],
  "image/webp": ["webp"],
  "image/gif": ["gif"],
}

function mediaError(code: string): Error {
  return new Error(code)
}

export function validateImageFileMetadata(input: {
  filename: string
  mimeType: string
  sizeBytes: number
}): AcceptedImageMime {
  if (!Number.isFinite(input.sizeBytes) || input.sizeBytes <= 0) {
    throw mediaError("INVALID_MEDIA_FILE")
  }

  if (input.sizeBytes > MAX_MEDIA_FILE_SIZE) {
    throw mediaError("MEDIA_FILE_TOO_LARGE")
  }

  if (!(input.mimeType in MIME_EXTENSIONS)) {
    throw mediaError("INVALID_MEDIA_TYPE")
  }

  const mimeType = input.mimeType as AcceptedImageMime
  const extension = input.filename
    .trim()
    .toLowerCase()
    .split(".")
    .pop()

  if (!extension || !MIME_EXTENSIONS[mimeType].includes(extension)) {
    throw mediaError("INVALID_MEDIA_TYPE")
  }

  return mimeType
}
