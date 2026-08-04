import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3"

import { buildPublicUrl } from "@/lib/media/storage"
import type {
  ObjectStorageProvider,
  ObjectUploadInput,
  R2StorageConfig,
} from "@/lib/media/types"

type R2Client = {
  send(command: unknown): Promise<unknown>
}

export function createR2StorageProvider(
  config: R2StorageConfig,
  client?: R2Client
): ObjectStorageProvider {
  const r2Client =
    client ??
    new S3Client({
      endpoint: config.endpoint,
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    })

  return {
    async upload(input: ObjectUploadInput): Promise<void> {
      await r2Client.send(
        new PutObjectCommand({
          Bucket: config.bucket,
          Key: input.objectKey,
          Body: input.body,
          ContentType: input.contentType,
        })
      )
    },
    async delete(objectKey: string): Promise<void> {
      await r2Client.send(
        new DeleteObjectCommand({
          Bucket: config.bucket,
          Key: objectKey,
        })
      )
    },
    publicUrl(objectKey: string): string {
      return buildPublicUrl(config.publicBaseUrl, objectKey)
    },
  }
}
