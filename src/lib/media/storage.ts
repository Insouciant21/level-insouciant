import { randomUUID } from "node:crypto"

import { getMediaStorageConfig } from "@/lib/media/config"
import { createCosStorageProvider } from "@/lib/media/providers/cos"
import { createOssStorageProvider } from "@/lib/media/providers/oss"
import { createR2StorageProvider } from "@/lib/media/providers/r2"
import type {
  AcceptedImageMime,
  MediaProviderKey,
  ObjectStorageProvider,
} from "@/lib/media/types"

export { getActiveMediaProvider } from "@/lib/media/config"

const SAFE_EXTENSIONS: Record<string, AcceptedImageMime> = {
  gif: "image/gif",
  jpeg: "image/jpeg",
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
}

export function buildPublicUrl(publicBaseUrl: string, objectKey: string): string {
  const base = publicBaseUrl.trim().replace(/\/+$/, "")
  const key = objectKey
    .replace(/^\/+/, "")
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/")

  return `${base}/${key}`
}

export function createObjectKey(filename: string): string {
  const extension = filename.trim().toLowerCase().split(".").pop() ?? ""
  const safeExtension = extension in SAFE_EXTENSIONS ? extension : "bin"
  const now = new Date()
  const year = now.getUTCFullYear()
  const month = String(now.getUTCMonth() + 1).padStart(2, "0")

  return `images/${year}/${month}/${randomUUID()}.${safeExtension}`
}

export function getObjectStorageProvider(
  provider?: MediaProviderKey
): ObjectStorageProvider {
  const config = getMediaStorageConfig(provider)

  switch (config.provider) {
    case "oss":
      return createOssStorageProvider(config)
    case "cos":
      return createCosStorageProvider(config)
    case "r2":
      return createR2StorageProvider(config)
  }
}
