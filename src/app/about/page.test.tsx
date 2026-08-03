// @vitest-environment jsdom

import { cleanup, render, screen, within } from "@testing-library/react"
import type { ComponentProps, ReactNode } from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { defaultSiteConfig, type SiteConfig } from "@/lib/site"

vi.mock("next/link", () => ({
  default: ({ children, ...props }: ComponentProps<"a">) => (
    <a {...props}>{children}</a>
  ),
}))

vi.mock("@/components/motion/page-transition", () => ({
  MotionReveal: ({ children }: { children: ReactNode }) => <>{children}</>,
}))

vi.mock("@/components/blog/page-shell", () => ({
  PageShell: ({ children }: { children: ReactNode }) => <main>{children}</main>,
}))

vi.mock("@/lib/site-config", () => ({
  getSiteConfig: vi.fn(),
}))

import AboutPage from "@/app/about/page"
import { getSiteConfig } from "@/lib/site-config"

const customSiteConfig = {
  ...defaultSiteConfig,
  name: "Custom Archive",
  url: "https://example.test",
  author: "Maintainer",
  email: "maintainer@example.test",
  about: {
    ...defaultSiteConfig.about,
    metadataTitle: "Configured About Metadata",
    metadataDescription: "Configured metadata description.",
    displayTitle: "Configured Maintainer",
    archiveNodeLabel: "Custom Archive Node",
    statusLabel: "Condition",
    statusValue: "Configured",
    quote: "A configured field note.",
    intro: "Configured introduction.",
    principles: "Configured principles.",
    contactHeading: "Configured Contacts",
    archiveAccess: {
      label: "Configured Archive Access",
      href: "/configured-archive",
    },
    transmission: {
      label: "Configured Transmission",
      href: "mailto:maintainer@example.test",
    },
  },
  contacts: [
    {
      id: "relay",
      kind: "custom",
      label: "Signal Relay",
      value: "custom.example.test",
      href: "https://custom.example.test/contact",
      enabled: true,
    },
    {
      id: "mail",
      kind: "email",
      label: "Direct Mail",
      value: "maintainer@example.test",
      href: "mailto:maintainer@example.test",
      enabled: true,
    },
    {
      id: "internal",
      kind: "website",
      label: "Internal Dossier",
      value: "Archive room",
      href: "/about/internal",
      enabled: true,
    },
    {
      id: "disabled",
      kind: "github",
      label: "Disabled Contact",
      value: "disabled.example.test",
      href: "https://disabled.example.test",
      enabled: false,
    },
  ],
} satisfies SiteConfig

beforeEach(() => {
  vi.mocked(getSiteConfig).mockResolvedValue(customSiteConfig)
})

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe("AboutPage", () => {
  it("renders configured identity, copy, actions, and enabled contacts", async () => {
    const { container } = render(await AboutPage())

    expect(
      screen.getByRole("heading", { name: "Configured Maintainer" })
    ).toBeTruthy()
    expect(screen.getByText("Archive Node: Custom Archive Node")).toBeTruthy()
    expect(screen.getByText("Condition: Configured")).toBeTruthy()
    expect(screen.getByText("A configured field note.")).toBeTruthy()
    expect(screen.getByText("Configured introduction.")).toBeTruthy()
    expect(screen.getByText("Configured principles.")).toBeTruthy()
    expect(
      screen.getByRole("heading", { name: /Configured Contacts/ })
    ).toBeTruthy()
    expect(
      screen.getByRole("link", { name: /Configured Archive Access/ })
    ).toHaveProperty("pathname", "/configured-archive")
    expect(
      screen.getByRole("link", { name: /Configured Transmission/ })
    ).toHaveProperty("protocol", "mailto:")

    const externalLink = screen.getByRole("link", {
      name: "custom.example.test",
    })
    const mailLink = screen.getByRole("link", {
      name: "maintainer@example.test",
    })
    const internalLink = screen.getByRole("link", { name: "Archive room" })

    expect(externalLink.getAttribute("target")).toBe("_blank")
    expect(externalLink.getAttribute("rel")).toBe("noreferrer")
    expect(mailLink.getAttribute("target")).toBeNull()
    expect(internalLink.getAttribute("target")).toBeNull()
    expect(screen.queryByText("Disabled Contact")).toBeNull()

    const customContact = screen.getByText("Signal Relay").closest("li")

    expect(customContact).not.toBeNull()
    expect(
      within(customContact as HTMLElement).getByText("custom.example.test")
    ).toBeTruthy()
    expect(customContact?.querySelector(".lucide-link")).not.toBeNull()
    expect(container.textContent).not.toContain("github.com/Insouciant21")
  })
})
