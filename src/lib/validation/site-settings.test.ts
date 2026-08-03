import { describe, expect, it } from "vitest"

import { defaultSiteConfig } from "@/lib/site"
import {
  mergeSiteConfig,
  normalizeSiteConfigData,
  siteConfigDataSchema,
  siteConfigOverridesSchema,
} from "@/lib/validation/site-settings"

describe("site settings validation", () => {
  it("accepts the default settings document", () => {
    expect(siteConfigDataSchema.parse(defaultSiteConfig)).toMatchObject({
      name: "Level Insouciant",
      about: { displayTitle: "Moeblue" },
    })
  })

  it("rejects unsafe href protocols", () => {
    const input = structuredClone(defaultSiteConfig)
    input.about.transmission.href = "javascript:alert(1)"

    expect(() => siteConfigDataSchema.parse(input)).toThrow()
  })

  it("trims text and keeps disabled contacts in their original order", () => {
    const input = structuredClone(defaultSiteConfig)
    input.name = "  Custom Archive  "
    input.contacts[0].label = "  GitHub  "
    input.contacts[1].enabled = false

    const result = normalizeSiteConfigData(input)

    expect(result.name).toBe("Custom Archive")
    expect(result.contacts.map((item) => item.enabled)).toEqual([true, false, true])
  })

  it("rejects unknown contact kinds", () => {
    const input = structuredClone(defaultSiteConfig)
    input.contacts[0].kind = "unknown" as never

    expect(() => siteConfigDataSchema.parse(input)).toThrow()
  })

  it("rejects more than twelve contacts", () => {
    const input = structuredClone(defaultSiteConfig)
    input.contacts = Array.from({ length: 13 }, (_, index) => ({
      id: "contact-" + index,
      kind: "custom",
      label: "Contact",
      value: "value",
      href: "/contact",
      enabled: true,
    }))

    expect(() => siteConfigDataSchema.parse(input)).toThrow()
  })

  it("uses validated defaults when a stored override has an unsafe href", () => {
    expect(
      mergeSiteConfig({
        about: {
          transmission: { href: "javascript:alert(1)" },
        },
      })
    ).toEqual(defaultSiteConfig)
  })

  it("normalizes one unknown legacy contact kind to custom", () => {
    const stored = {
      contacts: [
        {
          ...defaultSiteConfig.contacts[0],
          kind: "mastodon",
        },
      ],
    }

    expect(siteConfigOverridesSchema.parse(stored).contacts).toMatchObject([
      { kind: "custom" },
    ])
  })
})
