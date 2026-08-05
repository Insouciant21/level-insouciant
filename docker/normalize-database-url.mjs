import { pathToFileURL } from "node:url"

export function normalizeDatabaseUrl(value, { hostname, database }) {
  if (!value || !hostname || !database) {
    throw new Error("Database URL and Compose database overrides are required")
  }

  let url

  try {
    url = new URL(value)
  } catch {
    throw new Error("Database URL is invalid")
  }

  if (url.protocol !== "postgresql:" && url.protocol !== "postgres:") {
    throw new Error("Database URL must use the PostgreSQL protocol")
  }

  url.hostname = hostname
  url.pathname = `/${database}`

  return url.toString()
}

function run() {
  const variableName = process.argv[2]

  if (variableName !== "DATABASE_URL" && variableName !== "DIRECT_URL") {
    throw new Error("Expected DATABASE_URL or DIRECT_URL")
  }

  const normalizedUrl = normalizeDatabaseUrl(process.env[variableName], {
    hostname: process.env.DATABASE_HOST_OVERRIDE,
    database: process.env.DATABASE_NAME_OVERRIDE,
  })

  process.stdout.write(normalizedUrl)
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  try {
    run()
  } catch (error) {
    const message = error instanceof Error ? error.message : "Database URL normalization failed"
    process.stderr.write(`${message}\n`)
    process.exitCode = 1
  }
}
