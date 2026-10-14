import { describe, expect, it } from "vitest"
import { formatArchiveCode, getArchiveSignal } from "@/lib/archive-presentation"

describe("automatic archive codes", () => {
  it("assigns changing letters and an unrestricted sequence number", () => {
    expect(formatArchiveCode(1n)).toBe("AA-0001")
    expect(formatArchiveCode(2n)).toBe("AB-0002")
    expect(formatArchiveCode(26n)).toBe("AZ-0026")
    expect(formatArchiveCode(27n)).toBe("BA-0027")
    expect(formatArchiveCode(676n)).toBe("ZZ-0676")
    expect(formatArchiveCode(677n)).toBe("AA-0677")
    expect(formatArchiveCode(10000n)).toMatch(/^[A-Z]{2}-10000$/)
  })

  it("does not collide when prefixes repeat or numbers exceed JS integer precision", () => {
    const codes = Array.from({ length: 2000 }, (_, i) =>
      formatArchiveCode(BigInt(i + 1))
    )
    expect(new Set(codes).size).toBe(codes.length)
    expect(formatArchiveCode(9007199254740992n)).not.toBe(
      formatArchiveCode(9007199254740993n)
    )
  })

  it("uses the assigned code regardless of changes to article metadata", () => {
    const article = {
      archiveCode: "AQ-0017",
      title: "Before",
      category: "Notes",
      tags: ["one"],
    }
    expect(getArchiveSignal(article).designation).toBe("AQ-0017")
    const updated = {
      ...article,
      title: "After",
      category: "Other",
      tags: ["two"],
    }
    expect(getArchiveSignal(updated).designation).toBe("AQ-0017")
  })
})
