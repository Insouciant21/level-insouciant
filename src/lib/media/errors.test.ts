import { describe, expect, it } from "vitest"

import { getMediaErrorMessage } from "@/lib/media/errors"

describe("media error messages", () => {
  it("maps stable service error codes to administrator-facing Chinese", () => {
    expect(getMediaErrorMessage(new Error("MEDIA_FILE_TOO_LARGE"))).toBe(
      "图片不能超过 50 MB。"
    )
    expect(getMediaErrorMessage(new Error("provider leaked secret"))).toBe(
      "媒体操作失败，请稍后重试。"
    )
  })
})
