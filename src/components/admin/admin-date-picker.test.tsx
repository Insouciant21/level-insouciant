// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { AdminDatePicker } from "@/components/admin/admin-date-picker"

describe("AdminDatePicker", () => {
  it("serializes a selected local calendar date without a native date input", () => {
    const onChange = vi.fn()

    render(
      <AdminDatePicker
        id="published-at"
        name="publishedAt"
        value="2026-08-04"
        onChange={onChange}
        required
      />
    )

    expect(document.querySelector('input[type="date"]')).toBeNull()
    expect(screen.getByDisplayValue("2026-08-04").getAttribute("name")).toBe(
      "publishedAt"
    )

    fireEvent.click(screen.getByRole("button", { name: "打开日期选择器" }))

    expect(screen.getByRole("dialog")).toBeTruthy()
    expect(document.querySelectorAll("[data-calendar-cell]")).toHaveLength(42)
    expect(screen.getByRole("button", { name: "上个月" })).toBeTruthy()
    expect(screen.getByRole("button", { name: "下个月" })).toBeTruthy()

    fireEvent.click(
      screen.getByRole("button", { name: "选择 2026年8月12日" })
    )

    expect(onChange).toHaveBeenCalledWith("2026-08-12")
  })
})
