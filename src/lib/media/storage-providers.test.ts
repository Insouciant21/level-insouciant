import { describe, expect, it, vi } from "vitest"

import { createCosStorageProvider } from "@/lib/media/providers/cos"
import { createOssStorageProvider } from "@/lib/media/providers/oss"
import { createR2StorageProvider } from "@/lib/media/providers/r2"

const upload = {
  objectKey: "images/2026/08/image.png",
  body: Buffer.from("image"),
  contentType: "image/png" as const,
}

describe("object storage providers", () => {
  it("uploads, deletes, and builds URLs with OSS", async () => {
    const client = {
      put: vi.fn().mockResolvedValue(undefined),
      delete: vi.fn().mockResolvedValue(undefined),
    }
    const provider = createOssStorageProvider(
      {
        provider: "oss",
        bucket: "images",
        region: "oss-cn-hangzhou",
        accessKeyId: "key",
        accessKeySecret: "secret",
        publicBaseUrl: "https://cdn.example.com/media",
      },
      client
    )

    await provider.upload(upload)
    await provider.delete(upload.objectKey)

    expect(client.put).toHaveBeenCalledWith(upload.objectKey, upload.body, {
      headers: { "Content-Type": upload.contentType },
    })
    expect(client.delete).toHaveBeenCalledWith(upload.objectKey)
    expect(provider.publicUrl(upload.objectKey)).toBe(
      "https://cdn.example.com/media/images/2026/08/image.png"
    )
  })

  it("uploads, deletes, and builds URLs with COS", async () => {
    const client = {
      putObject: vi.fn().mockResolvedValue(undefined),
      deleteObject: vi.fn().mockResolvedValue(undefined),
    }
    const provider = createCosStorageProvider(
      {
        provider: "cos",
        bucket: "images-1250000000",
        region: "ap-guangzhou",
        secretId: "id",
        secretKey: "secret",
        publicBaseUrl: "https://cdn.example.com/media",
      },
      client
    )

    await provider.upload(upload)
    await provider.delete(upload.objectKey)

    expect(client.putObject).toHaveBeenCalledWith({
      Bucket: "images-1250000000",
      Region: "ap-guangzhou",
      Key: upload.objectKey,
      Body: upload.body,
      ContentType: upload.contentType,
    })
    expect(client.deleteObject).toHaveBeenCalledWith({
      Bucket: "images-1250000000",
      Region: "ap-guangzhou",
      Key: upload.objectKey,
    })
    expect(provider.publicUrl(upload.objectKey)).toBe(
      "https://cdn.example.com/media/images/2026/08/image.png"
    )
  })

  it("uses S3 commands with R2", async () => {
    const client = {
      send: vi.fn().mockResolvedValue({}),
    }
    const provider = createR2StorageProvider(
      {
        provider: "r2",
        bucket: "images",
        endpoint: "https://account.r2.cloudflarestorage.com",
        region: "auto",
        accessKeyId: "key",
        secretAccessKey: "secret",
        publicBaseUrl: "https://cdn.example.com/media",
      },
      client
    )

    await provider.upload(upload)
    await provider.delete(upload.objectKey)

    const [uploadCommand, deleteCommand] = client.send.mock.calls.map(
      ([command]) => command.input
    )

    expect(uploadCommand).toMatchObject({
      Bucket: "images",
      Key: upload.objectKey,
      Body: upload.body,
      ContentType: upload.contentType,
    })
    expect(deleteCommand).toMatchObject({
      Bucket: "images",
      Key: upload.objectKey,
    })
    expect(provider.publicUrl(upload.objectKey)).toBe(
      "https://cdn.example.com/media/images/2026/08/image.png"
    )
  })
})
