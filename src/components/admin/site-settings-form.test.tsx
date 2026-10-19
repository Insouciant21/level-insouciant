// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { SiteSettingsForm } from "@/components/admin/site-settings-form"
import { defaultSiteConfig } from "@/lib/site"

vi.mock("@/lib/action-links", () => ({
  updateSiteSettingsAction: vi.fn(),
}))

afterEach(cleanup)

function getSerializedSettings() {
  const field = document.querySelector<HTMLInputElement>(
    'input[type="hidden"][name="settings"]'
  )

  if (!field) {
    throw new Error("Expected the serialized settings field to be rendered")
  }

  return JSON.parse(field.value) as Record<string, unknown>
}

describe("SiteSettingsForm", () => {
  it("renders the approved editable settings fields", () => {
    render(<SiteSettingsForm siteConfig={defaultSiteConfig} />)

    const form = screen
      .getByRole("button", { name: "保存站点设置" })
      .closest("form")

    expect(form).not.toBeNull()
    expect(form?.classList.contains("site-settings-form")).toBe(true)
    expect((screen.getByLabelText("站点名称") as HTMLInputElement).value).toBe(
      "Level Insouciant"
    )
    expect(screen.getByLabelText("站点名称").classList.contains("admin-input")).toBe(true)
    expect(screen.getByLabelText("站点描述").classList.contains("admin-input")).toBe(true)
    expect(screen.queryByLabelText("描述")).toBeNull()
    expect(screen.queryByLabelText("页脚结束语")).toBeNull()
    expect(screen.queryByLabelText("眉题")).toBeNull()
    expect(screen.queryByLabelText("主按钮文字")).toBeNull()
    expect(screen.queryByLabelText("主按钮地址")).toBeNull()
    expect(screen.queryByLabelText("次按钮文字")).toBeNull()
    expect(screen.queryByLabelText("次按钮地址")).toBeNull()
    expect((screen.getByLabelText("须知页标题") as HTMLInputElement).value).toBe("Moeblue")
    expect(screen.getByRole("button", { name: "添加联系方式" })).toBeTruthy()

    const settings = getSerializedSettings()
    expect(settings.hero).not.toHaveProperty("description")
    expect(settings.hero).not.toHaveProperty("eyebrow")
    expect(settings.hero).not.toHaveProperty("primaryAction")
    expect(settings.hero).not.toHaveProperty("secondaryAction")
    expect(settings.footer).not.toHaveProperty("closing")
  })

  it("shows the expanded icon-bearing contact kind options", () => {
    render(<SiteSettingsForm siteConfig={defaultSiteConfig} />)

    fireEvent.click(screen.getAllByRole("combobox")[0])

    expect(screen.getByRole("option", { name: "Twitter" })).toBeTruthy()
    expect(screen.getByRole("option", { name: "LinkedIn" })).toBeTruthy()
    expect(screen.getByRole("option", { name: "网易云音乐" })).toBeTruthy()
    expect(screen.getByRole("option", { name: "哔哩哔哩" })).toBeTruthy()
  })

  it("keeps the contact kind menu free of a native scrollbar edge", () => {
    render(<SiteSettingsForm siteConfig={defaultSiteConfig} />)

    fireEvent.click(screen.getAllByRole("combobox")[0])

    expect(
      document.querySelector('[data-slot="select-viewport"]')?.className
    ).toContain("select-viewport-no-scrollbar")
  })

  it("serializes contact additions, ordering, enabled state, and removals", () => {
    render(<SiteSettingsForm siteConfig={defaultSiteConfig} />)

    fireEvent.click(screen.getByRole("button", { name: "添加联系方式" }))
    fireEvent.click(
      screen.getAllByRole("button", { name: "上移" })[defaultSiteConfig.contacts.length]
    )

    let settings = getSerializedSettings()
    expect(settings.contacts).toEqual([
      defaultSiteConfig.contacts[0],
      defaultSiteConfig.contacts[1],
      {
        id: expect.any(String),
        kind: "custom",
        label: "",
        value: "",
        href: "",
        enabled: true,
      },
      defaultSiteConfig.contacts[2],
    ])

    fireEvent.click(
      screen.getAllByRole("button", { name: "禁用" })[defaultSiteConfig.contacts.length - 1]
    )

    settings = getSerializedSettings()
    expect((settings.contacts as Array<{ enabled: boolean }>)[2].enabled).toBe(false)

    fireEvent.click(
      screen.getAllByRole("button", { name: "删除" })[defaultSiteConfig.contacts.length - 1]
    )

    settings = getSerializedSettings()
    expect(settings.contacts).toEqual(defaultSiteConfig.contacts)
    expect(settings).not.toHaveProperty("locale")
    expect(settings).not.toHaveProperty("language")
    expect(settings).not.toHaveProperty("nav")
    expect(settings).not.toHaveProperty("socials")
  })

  it("disables moves that would exceed contact boundaries", () => {
    render(<SiteSettingsForm siteConfig={defaultSiteConfig} />)

    expect((screen.getAllByRole("button", { name: "上移" })[0] as HTMLButtonElement).disabled).toBe(true)
    expect(
      (screen.getAllByRole("button", { name: "下移" })[
        defaultSiteConfig.contacts.length - 1
      ] as HTMLButtonElement).disabled
    ).toBe(true)
  })

  it("does not render an actionable preview for an unsafe unsaved contact link", () => {
    render(<SiteSettingsForm siteConfig={defaultSiteConfig} />)

    fireEvent.change(document.getElementById("联系方式-0-href")!, {
      target: { value: "javascript:alert(1)" },
    })

    expect(document.querySelector('a[href="javascript:alert(1)"]')).toBeNull()
    expect(screen.getAllByRole("link", { name: "打开链接" })).toHaveLength(
      defaultSiteConfig.contacts.length + defaultSiteConfig.footer.links.length - 1
    )
  })

  it("serializes footer link additions independently from contacts", () => {
    render(<SiteSettingsForm siteConfig={defaultSiteConfig} />)

    fireEvent.click(screen.getByRole("button", { name: "添加页脚链接" }))
    fireEvent.click(
      screen.getAllByRole("button", { name: "上移" })[
        defaultSiteConfig.contacts.length + defaultSiteConfig.footer.links.length
      ]
    )

    const settings = getSerializedSettings()
    expect(settings.contacts).toEqual(defaultSiteConfig.contacts)
    expect((settings.footer as { links: unknown[] }).links).toEqual([
      defaultSiteConfig.footer.links[0],
      defaultSiteConfig.footer.links[1],
      {
        id: expect.any(String),
        kind: "custom",
        label: "",
        value: "",
        href: "",
        enabled: true,
      },
      defaultSiteConfig.footer.links[2],
    ])
  })
})
