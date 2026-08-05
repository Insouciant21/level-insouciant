import { spawnSync } from "node:child_process"
import { fileURLToPath } from "node:url"

import { describe, expect, it } from "vitest"

import { normalizeDatabaseUrl } from "./normalize-database-url.mjs"

describe("normalizeDatabaseUrl", () => {
  it("overrides host and database while preserving credentials, port, and query", () => {
    const result = normalizeDatabaseUrl(
      "postgresql://app:p%40ss@localhost:5432/?schema=public&sslmode=require",
      { hostname: "postgresql", database: "level-insouciant" }
    )

    expect(result).toBe(
      "postgresql://app:p%40ss@postgresql:5432/level-insouciant?schema=public&sslmode=require"
    )
  })

  it("rejects non-PostgreSQL URLs", () => {
    expect(() =>
      normalizeDatabaseUrl("https://user:secret@example.com/db", {
        hostname: "postgresql",
        database: "level-insouciant",
      })
    ).toThrow("PostgreSQL protocol")
  })

  it("fails the CLI without echoing an invalid secret URL", () => {
    const secretUrl = "not-a-url-containing-a-secret"
    const scriptPath = fileURLToPath(new URL("./normalize-database-url.mjs", import.meta.url))
    const result = spawnSync(process.execPath, [scriptPath, "DATABASE_URL"], {
      encoding: "utf8",
      env: {
        ...process.env,
        DATABASE_URL: secretUrl,
        DATABASE_HOST_OVERRIDE: "postgresql",
        DATABASE_NAME_OVERRIDE: "level-insouciant",
      },
    })

    expect(result.status).toBe(1)
    expect(result.stderr).toContain("Database URL is invalid")
    expect(result.stderr).not.toContain(secretUrl)
  })
})
