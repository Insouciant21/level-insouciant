import { describe, expect, it } from "vitest"

import {
  MAX_MEDIA_FILE_SIZE,
  validateImageFileMetadata,
} from "@/lib/media/validation"

describe("image upload validation", () => {
  it("accepts each supported image type at the size limit", () => {
    for (const [mimeType, extension] of [
      ["image/jpeg", "jpg"],
      ["image/png", "png"],
      ["image/webp", "webp"],
      ["image/gif", "gif"],
    ] as const) {
      expect(
        validateImageFileMetadata({
          filename: `image.${extension}`,
          mimeType,
          sizeBytes: MAX_MEDIA_FILE_SIZE,
        })
      ).toBe(mimeType)
    }
  })

  it("rejects empty files", () => {
    expect(() =>
      validateImageFileMetadata({
        filename: "image.png",
        mimeType: "image/png",
        sizeBytes: 0,
      })
    ).toThrow("INVALID_MEDIA_FILE")
  })

  it("rejects files larger than 50 MB", () => {
    expect(() =>
      validateImageFileMetadata({
        filename: "image.png",
        mimeType: "image/png",
        sizeBytes: MAX_MEDIA_FILE_SIZE + 1,
      })
    ).toThrow("MEDIA_FILE_TOO_LARGE")
  })

  it("rejects SVG and mismatched extensions", () => {
    expect(() =>
      validateImageFileMetadata({
        filename: "image.svg",
        mimeType: "image/svg+xml",
        sizeBytes: 10,
      })
    ).toThrow("INVALID_MEDIA_TYPE")

    expect(() =>
      validateImageFileMetadata({
        filename: "image.svg",
        mimeType: "image/png",
        sizeBytes: 10,
      })
    ).toThrow("INVALID_MEDIA_TYPE")
  })
})
