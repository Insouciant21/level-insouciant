import { describe, expect, it } from "vitest"

import {
  loginInputSchema,
  passwordChangeInputSchema,
  profileInputSchema,
  registrationInputSchema,
} from "@/lib/validation/auth"

describe("authentication input schemas", () => {
  it("normalizes registration and profile values", () => {
    const registration = registrationInputSchema.parse({
      name: "  Insouciant  ",
      email: " USER@EXAMPLE.COM ",
      password: "password",
    })
    const profile = profileInputSchema.parse({
      name: "  Updated Name  ",
      email: " UPDATED@EXAMPLE.COM ",
      avatarUrl: " https://example.com/avatar.png ",
    })

    expect(registration).toEqual({
      name: "Insouciant",
      email: "user@example.com",
      password: "password",
    })
    expect(profile).toEqual({
      name: "Updated Name",
      email: "updated@example.com",
      avatarUrl: "https://example.com/avatar.png",
    })
  })

  it("keeps login passwords exact while normalizing the email", () => {
    expect(
      loginInputSchema.parse({
        email: " USER@EXAMPLE.COM ",
        password: "  pass phrase  ",
      })
    ).toEqual({
      email: "user@example.com",
      password: "  pass phrase  ",
    })
  })

  it("rejects short passwords and mismatched confirmation values", () => {
    expect(
      passwordChangeInputSchema.safeParse({
        currentPassword: "old-password",
        nextPassword: "short",
        confirmPassword: "short",
      }).success
    ).toBe(false)

    expect(
      passwordChangeInputSchema.safeParse({
        currentPassword: "old-password",
        nextPassword: "new-password",
        confirmPassword: "different-password",
      }).success
    ).toBe(false)
  })
})
