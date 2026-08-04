import { afterEach, describe, expect, it, vi } from "vitest"

import {
  getActiveMediaProvider,
  getMediaStorageConfig,
} from "@/lib/media/config"

afterEach(() => {
  vi.unstubAllEnvs()
})

describe("media storage configuration", () => {
  it("rejects an unsupported active provider", () => {
    vi.stubEnv("MEDIA_STORAGE_PROVIDER", "local")

    expect(() => getActiveMediaProvider()).toThrow(
      "MEDIA_STORAGE_NOT_CONFIGURED"
    )
  })

  it("requires the selected provider configuration", () => {
    vi.stubEnv("MEDIA_STORAGE_PROVIDER", "r2")

    expect(() => getMediaStorageConfig()).toThrow(
      "MEDIA_STORAGE_NOT_CONFIGURED"
    )
  })

  it("normalizes the R2 public base URL", () => {
    vi.stubEnv("MEDIA_STORAGE_PROVIDER", "r2")
    vi.stubEnv("R2_ACCOUNT_ID", "account-1")
    vi.stubEnv("R2_BUCKET", "images")
    vi.stubEnv("R2_ACCESS_KEY_ID", "key")
    vi.stubEnv("R2_SECRET_ACCESS_KEY", "secret")
    vi.stubEnv("R2_PUBLIC_BASE_URL", "https://cdn.example.com/media/")

    expect(getMediaStorageConfig()).toEqual({
      provider: "r2",
      bucket: "images",
      endpoint: "https://account-1.r2.cloudflarestorage.com",
      region: "auto",
      accessKeyId: "key",
      secretAccessKey: "secret",
      publicBaseUrl: "https://cdn.example.com/media",
    })
  })
})
