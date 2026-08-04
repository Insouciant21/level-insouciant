import COS from "cos-nodejs-sdk-v5"

import { buildPublicUrl } from "@/lib/media/storage"
import type {
  CosStorageConfig,
  ObjectStorageProvider,
  ObjectUploadInput,
} from "@/lib/media/types"

type CosClient = {
  putObject(input: {
    Bucket: string
    Region: string
    Key: string
    Body: Buffer
    ContentType: string
  }): Promise<unknown>
  deleteObject(input: {
    Bucket: string
    Region: string
    Key: string
  }): Promise<unknown>
}

export function createCosStorageProvider(
  config: CosStorageConfig,
  client?: CosClient
): ObjectStorageProvider {
  const cosClient =
    client ?? new COS({ SecretId: config.secretId, SecretKey: config.secretKey })

  return {
    async upload(input: ObjectUploadInput): Promise<void> {
      await cosClient.putObject({
        Bucket: config.bucket,
        Region: config.region,
        Key: input.objectKey,
        Body: input.body,
        ContentType: input.contentType,
      })
    },
    async delete(objectKey: string): Promise<void> {
      await cosClient.deleteObject({
        Bucket: config.bucket,
        Region: config.region,
        Key: objectKey,
      })
    },
    publicUrl(objectKey: string): string {
      return buildPublicUrl(config.publicBaseUrl, objectKey)
    },
  }
}
