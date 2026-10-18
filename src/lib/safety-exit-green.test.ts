import { readFileSync, readdirSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

const projectRoot = fileURLToPath(new URL("../../", import.meta.url))
const sourceRoot = path.join(projectRoot, "src")

function collectSourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name)

    if (entry.isDirectory()) {
      return collectSourceFiles(entryPath)
    }

    return /\.(?:css|ts|tsx)$/.test(entry.name) &&
      !entry.name.includes(".test.")
      ? [entryPath]
      : []
  })
}

const source = collectSourceFiles(sourceRoot)
  .map((filePath) => readFileSync(filePath, "utf8"))
  .join("\n")

const globals = readFileSync(
  path.join(sourceRoot, "styles/globals.css"),
  "utf8"
)

describe("safety exit green palette", () => {
  it("defines the approved shared safety-exit tokens", () => {
    const globals = readFileSync(
      path.join(sourceRoot, "styles/globals.css"),
      "utf8"
    )

    expect(globals).toContain("--safety-exit-green-rgb: 0 155 78;")
    expect(globals).toContain("--safety-exit-green: #009b4e;")
    expect(globals).toContain("--safety-exit-green-strong: #62d99a;")
  })

  it("scopes the restored grass green to the home atmosphere", () => {
    expect(globals).toContain("--home-accent-green-rgb: 162 201 87;")
    expect(globals).toContain("--home-accent-green: #a2c957;")
    expect(globals).toContain("rgb(var(--home-accent-green-rgb) / 11%),")
  })

  it("does not retain the previous grass-green literals or token", () => {
    expect(source).not.toContain("--fluorescent-green")
    expect(source.match(/#a2c957/gi)).toHaveLength(1)
    expect(source.match(/162 201 87/g)).toHaveLength(1)
    expect(source).not.toMatch(/#b8d77c|#d0ec93|#a9c77a/i)
    expect(source).not.toMatch(/rgb\((?:162 201 87|184 215 124)\s*\//i)
  })

  it("does not retain unrelated green utilities or literals", () => {
    expect(source).not.toMatch(/\b(?:bg|text|border)-green-\d{3}\b/)
    expect(source).not.toContain("#4ade80")
    expect(source).not.toContain("rgba(74,222,128")
  })
})
