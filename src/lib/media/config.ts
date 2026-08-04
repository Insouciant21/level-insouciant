import type {
  CosStorageConfig,
  MediaProviderKey,
  MediaStorageConfig,
  OssStorageConfig,
  R2StorageConfig,
} from "@/lib/media/types"

const MEDIA_STORAGE_NOT_CONFIGURED = "MEDIA_STORAGE_NOT_CONFIGURED"

function configurationError(): Error {
  return new Error(MEDIA_STORAGE_NOT_CONFIGURED)
}

function requiredEnv(name: string): string {
  const value = process.env[name]?.trim()

  if (!value) {
    throw configurationError()
  }

  return value
}

function normalizePublicBaseUrl(value: string): string {
  return value.trim().replace(/\/+$/, "")
}

function readOssConfig(): OssStorageConfig {
  const endpoint = process.env.OSS_ENDPOINT?.trim()

  return {
    provider: "oss",
    bucket: requiredEnv("OSS_BUCKET"),
    region: requiredEnv("OSS_REGION"),
    ...(endpoint ? { endpoint } : {}),
    accessKeyId: requiredEnv("OSS_ACCESS_KEY_ID"),
    accessKeySecret: requiredEnv("OSS_ACCESS_KEY_SECRET"),
    publicBaseUrl: normalizePublicBaseUrl(requiredEnv("OSS_PUBLIC_BASE_URL")),
  }
}

function readCosConfig(): CosStorageConfig {
  return {
    provider: "cos",
    bucket: requiredEnv("COS_BUCKET"),
    region: requiredEnv("COS_REGION"),
    secretId: requiredEnv("COS_SECRET_ID"),
    secretKey: requiredEnv("COS_SECRET_KEY"),
    publicBaseUrl: normalizePublicBaseUrl(requiredEnv("COS_PUBLIC_BASE_URL")),
  }
}

function readR2Config(): R2StorageConfig {
  const accountId = requiredEnv("R2_ACCOUNT_ID")

  return {
    provider: "r2",
    bucket: requiredEnv("R2_BUCKET"),
    endpoint:
      process.env.R2_ENDPOINT?.trim() ||
      `https://${accountId}.r2.cloudflarestorage.com`,
    region: "auto",
    accessKeyId: requiredEnv("R2_ACCESS_KEY_ID"),
    secretAccessKey: requiredEnv("R2_SECRET_ACCESS_KEY"),
    publicBaseUrl: normalizePublicBaseUrl(requiredEnv("R2_PUBLIC_BASE_URL")),
  }
}

export function getActiveMediaProvider(): MediaProviderKey {
  const provider = process.env.MEDIA_STORAGE_PROVIDER?.trim().toLowerCase()

  if (provider !== "oss" && provider !== "cos" && provider !== "r2") {
    throw configurationError()
  }

  return provider
}

export function getMediaStorageConfig(
  provider: MediaProviderKey = getActiveMediaProvider()
): MediaStorageConfig {
  switch (provider) {
    case "oss":
      return readOssConfig()
    case "cos":
      return readCosConfig()
    case "r2":
      return readR2Config()
    default:
      throw configurationError()
  }
}
