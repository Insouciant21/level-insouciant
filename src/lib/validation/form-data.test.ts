import { describe, expect, it } from "vitest"

import {
  parseCommentRequestBody,
  parseLoginFormData,
  parseManagedArticleFormData,
  parsePasswordChangeFormData,
  parseProfileFormData,
  parseRegistrationFormData,
} from "@/lib/validation/form-data"

function createArticleFormData(intent = "draft") {
  const formData = new FormData()
  formData.set("slug", " hello ")
  formData.set("title", " Hello ")
  formData.set("desc", " Summary ")
  formData.set("category", " Notes ")
  formData.set("tags", " systems, systems\nwriting ")
  formData.set("cover", " ")
  formData.set("publishedAt", "2026-08-02")
  formData.set("content", " # Body ")
  formData.set("intent", intent)
  return formData
}

describe("validation form-data adapters", () => {
  it("normalizes managed article fields and maps publish intent", () => {
    expect(parseManagedArticleFormData(createArticleFormData())).toEqual({
      slug: "hello",
      title: "Hello",
      desc: "Summary",
      category: "Notes",
      tags: ["systems", "writing"],
      cover: "",
      publishedAt: "2026-08-02",
      content: "# Body",
      draft: true,
    })
    expect(
      parseManagedArticleFormData(createArticleFormData("publish")).draft
    ).toBe(false)
  })

  it("parses authentication forms and comment JSON at their boundaries", () => {
    const login = new FormData()
    login.set("email", " USER@EXAMPLE.COM ")
    login.set("password", " password ")

    const registration = new FormData()
    registration.set("name", " User ")
    registration.set("email", " USER@EXAMPLE.COM ")
    registration.set("password", "password")

    const profile = new FormData()
    profile.set("name", " User ")
    profile.set("email", " USER@EXAMPLE.COM ")
    profile.set("avatarUrl", " https://example.com/avatar.png ")

    const password = new FormData()
    password.set("currentPassword", "old-password")
    password.set("nextPassword", "new-password")
    password.set("confirmPassword", "new-password")

    expect(parseLoginFormData(login)).toEqual({
      email: "user@example.com",
      password: "password",
    })
    expect(parseRegistrationFormData(registration).email).toBe(
      "user@example.com"
    )
    expect(parseProfileFormData(profile).avatarUrl).toBe(
      "https://example.com/avatar.png"
    )
    expect(parsePasswordChangeFormData(password).nextPassword).toBe(
      "new-password"
    )
    expect(parseCommentRequestBody({ content: " hello ", parentId: " " })).toEqual({
      content: "hello",
      parentId: null,
    })
  })

  it("rejects invalid article dates and unknown comment bodies", () => {
    const formData = createArticleFormData()
    formData.set("publishedAt", "not-a-date")

    expect(() => parseManagedArticleFormData(formData)).toThrow()
    expect(() => parseCommentRequestBody(null)).toThrow()
  })
})
