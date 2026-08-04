export type MediaProviderKey = "oss" | "cos" | "r2"

export type AcceptedImageMime =
  | "image/jpeg"
  | "image/png"
  | "image/webp"
  | "image/gif"

export type ObjectUploadInput = {
  objectKey: string
  body: Buffer
  contentType: AcceptedImageMime
}

export interface ObjectStorageProvider {
  upload(input: ObjectUploadInput): Promise<void>
  delete(objectKey: string): Promise<void>
  publicUrl(objectKey: string): string
}

export type OssStorageConfig = {
  provider: "oss"
  bucket: string
  region: string
  endpoint?: string
  accessKeyId: string
  accessKeySecret: string
  publicBaseUrl: string
}

export type CosStorageConfig = {
  provider: "cos"
  bucket: string
  region: string
  secretId: string
  secretKey: string
  publicBaseUrl: string
}

export type R2StorageConfig = {
  provider: "r2"
  bucket: string
  endpoint: string
  region: "auto"
  accessKeyId: string
  secretAccessKey: string
  publicBaseUrl: string
}

export type MediaStorageConfig =
  | OssStorageConfig
  | CosStorageConfig
  | R2StorageConfig
