import OSS from "ali-oss"

import { buildPublicUrl } from "@/lib/media/storage"
import type {
  ObjectStorageProvider,
  ObjectUploadInput,
  OssStorageConfig,
} from "@/lib/media/types"

type OssClient = {
  put(
    objectKey: string,
    body: Buffer,
    options: { headers: { "Content-Type": string } }
  ): Promise<unknown>
  delete(objectKey: string): Promise<unknown>
}

type OssClientConstructor = new (options: {
  region: string
  bucket: string
  endpoint?: string
  accessKeyId: string
  accessKeySecret: string
}) => OssClient

export function createOssStorageProvider(
  config: OssStorageConfig,
  client?: OssClient
): ObjectStorageProvider {
  const ossClient =
    client ??
    new (OSS as unknown as OssClientConstructor)({
      region: config.region,
      bucket: config.bucket,
      ...(config.endpoint ? { endpoint: config.endpoint } : {}),
      accessKeyId: config.accessKeyId,
      accessKeySecret: config.accessKeySecret,
    })

  return {
    async upload(input: ObjectUploadInput): Promise<void> {
      await ossClient.put(input.objectKey, input.body, {
        headers: { "Content-Type": input.contentType },
      })
    },
    async delete(objectKey: string): Promise<void> {
      await ossClient.delete(objectKey)
    },
    publicUrl(objectKey: string): string {
      return buildPublicUrl(config.publicBaseUrl, objectKey)
    },
  }
}
