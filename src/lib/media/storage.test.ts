import { describe, expect, it } from "vitest"

import {
  buildPublicUrl,
  createObjectKey,
} from "@/lib/media/storage"

describe("media storage utilities", () => {
  it("joins a public base URL and object key without duplicate slashes", () => {
    expect(buildPublicUrl("https://cdn.example.com/media/", "images/a.png")).toBe(
      "https://cdn.example.com/media/images/a.png"
    )
  })

  it("creates an immutable image object key with a safe extension", () => {
    const objectKey = createObjectKey("My screen shot.PNG")

    expect(objectKey).toMatch(/^images\/\d{4}\/\d{2}\/[a-z0-9-]+\.png$/)
    expect(objectKey).not.toContain("My screen")
  })
})
