// @vitest-environment jsdom

import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { AdminSelect } from "@/components/admin/admin-select"
import { contactKindOptions } from "@/lib/contact-kinds"

describe("AdminSelect", () => {
  it("renders the selected icon and value trigger", () => {
    render(
      <AdminSelect
        id="contact-kind"
        value="twitter"
        options={contactKindOptions}
        onValueChange={vi.fn()}
      />
    )

    const trigger = screen.getByRole("combobox")

    expect(trigger.getAttribute("id")).toBe("contact-kind")
    expect(trigger.textContent).toContain("Twitter")
    expect(trigger.querySelector(".lucide-twitter")).not.toBeNull()
  })
})
