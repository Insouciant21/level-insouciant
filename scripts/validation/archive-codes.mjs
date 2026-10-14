import assert from "node:assert/strict"
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"
import { normalizeDatabaseUrl } from "../../docker/normalize-database-url.mjs"

const database = process.env.DATABASE_NAME_OVERRIDE
if (
  process.env.STAGING_WRITE_TESTS !== "1" ||
  !database?.endsWith("-staging")
) {
  throw new Error(
    "Archive write validation requires an isolated staging database"
  )
}
const pool = new Pool({
  connectionString: normalizeDatabaseUrl(process.env.DATABASE_URL, {
    hostname: process.env.DATABASE_HOST_OVERRIDE,
    database,
  }),
})
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) })
const prefix = `archive-code-validation-${Date.now()}`
const base = "http://127.0.0.1:3000"
const data = {
  title: prefix,
  desc: "Automatic code validation",
  content: "## Validation\n\nBody",
  category: "Code validation",
  tags: ["code-validation"],
  searchDocument: prefix,
  publishedAt: new Date(),
  draft: false,
}
async function search() {
  const response = await fetch(
    `${base}/api/search?q=${encodeURIComponent(prefix)}`
  )
  assert.equal(response.status, 200)
  const { results } = await response.json()
  return results.filter((article) => article.slug.startsWith(prefix))
}
async function pageCode(slug) {
  const response = await fetch(`${base}/articles/${slug}`)
  assert.equal(response.status, 200)
  return (await response.text()).match(/Code:\s*([A-Z]-\d{4,})/)?.[1]
}
try {
  const existing = await prisma.article.findMany({
    select: { archiveNumber: true },
  })
  assert.ok(existing.every((article) => article.archiveNumber > 0n))
  assert.equal(
    new Set(existing.map((article) => article.archiveNumber.toString())).size,
    existing.length
  )
  console.log(
    `PASS backfill: ${existing.length} existing articles have unique automatic numbers`
  )

  const created = await Promise.all(
    Array.from({ length: 12 }, (_, i) =>
      prisma.article.create({ data: { ...data, slug: `${prefix}-${i}` } })
    )
  )
  assert.equal(
    new Set(created.map((article) => article.archiveNumber.toString())).size,
    created.length
  )
  const results = await search()
  assert.equal(results.length, created.length)
  assert.ok(
    results.every((article) => /^[A-Z]-\d{4,}$/.test(article.archiveCode))
  )
  assert.equal(
    new Set(results.map((article) => article.archiveCode)).size,
    results.length
  )
  const first = results.find((article) => article.slug === created[0].slug)
  assert.equal(await pageCode(first.slug), first.archiveCode)
  console.log(
    "PASS concurrent allocation, JSON-safe search and matching article code"
  )

  const updated = await prisma.article.update({
    where: { slug: first.slug },
    data: {
      title: "Edited title",
      category: "Other",
      tags: ["changed", "order"],
    },
  })
  assert.equal(updated.archiveNumber, created[0].archiveNumber)
  assert.equal(await pageCode(first.slug), first.archiveCode)
  const imported = await prisma.article.upsert({
    where: { slug: first.slug },
    create: { ...data, slug: first.slug },
    update: { ...data },
  })
  assert.equal(imported.archiveNumber, created[0].archiveNumber)
  const freshImport = await prisma.article.upsert({
    where: { slug: `${prefix}-import` },
    create: { ...data, slug: `${prefix}-import` },
    update: { ...data },
  })
  assert.ok(freshImport.archiveNumber > 0n)
  await assert.rejects(
    prisma.article.create({
      data: {
        ...data,
        slug: `${prefix}-collision`,
        archiveNumber: created[0].archiveNumber,
      },
    }),
    (error) => error.code === "P2002"
  )
  console.log(
    "PASS metadata edits and import upserts preserve codes; database rejects duplicate numbers"
  )

  await prisma.article.delete({ where: { slug: first.slug } })
  const replacement = await prisma.article.create({
    data: { ...data, slug: `${prefix}-replacement` },
  })
  assert.ok(replacement.archiveNumber > created[0].archiveNumber)
  console.log("PASS deleted numbers are not reused")
} finally {
  await prisma.article.deleteMany({ where: { slug: { startsWith: prefix } } })
  await prisma.$disconnect()
  await pool.end()
}
