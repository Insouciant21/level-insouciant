import fs from "node:fs/promises"
import path from "node:path"

import matter from "gray-matter"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@prisma/client"
import { Pool } from "pg"

const cwd = process.cwd()
const sourceDirectories = [
  path.join(cwd, "content", "article-seeds"),
  path.join(cwd, "content", "articles"),
]

function buildSearchDocument(input) {
  return [input.title, input.desc, input.category, input.tags.join(" "), input.content].join(" ").trim()
}

async function resolveArticlesDirectory() {
  for (const directory of sourceDirectories) {
    try {
      const stat = await fs.stat(directory)
      if (stat.isDirectory()) {
        return directory
      }
    } catch {}
  }

  throw new Error("No article seed directory found.")
}

function assertFrontmatter(data, filePath) {
  const requiredFields = ["title", "desc", "date", "tags", "category", "cover", "draft", "slug"]

  for (const field of requiredFields) {
    if (!(field in data)) {
      throw new Error(`Missing frontmatter field "${field}" in ${filePath}`)
    }
  }

  if (!Array.isArray(data.tags) || !data.tags.every((tag) => typeof tag === "string")) {
    throw new Error(`Invalid "tags" frontmatter in ${filePath}`)
  }

  if (typeof data.category !== "string") {
    throw new Error(`Invalid "category" frontmatter in ${filePath}`)
  }

  if (typeof data.draft !== "boolean") {
    throw new Error(`Invalid "draft" frontmatter in ${filePath}`)
  }

  return {
    title: String(data.title),
    desc: String(data.desc),
    date: String(data.date),
    tags: data.tags,
    category: String(data.category),
    cover: String(data.cover),
    draft: data.draft,
    slug: String(data.slug),
  }
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required.")
  }

  const articlesDirectory = await resolveArticlesDirectory()
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  })
  const adapter = new PrismaPg(pool)
  const prisma = new PrismaClient({ adapter })

  try {
    const files = (await fs.readdir(articlesDirectory)).filter((file) => file.endsWith(".mdx")).sort()

    for (const fileName of files) {
      const filePath = path.join(articlesDirectory, fileName)
      const source = await fs.readFile(filePath, "utf8")
      const parsed = matter(source)
      const frontmatter = assertFrontmatter(parsed.data, filePath)
      const searchDocument = buildSearchDocument({
        title: frontmatter.title,
        desc: frontmatter.desc,
        category: frontmatter.category,
        tags: frontmatter.tags,
        content: parsed.content,
      })

      await prisma.article.upsert({
        where: {
          slug: frontmatter.slug,
        },
        create: {
          slug: frontmatter.slug,
          title: frontmatter.title,
          desc: frontmatter.desc,
          content: parsed.content,
          category: frontmatter.category,
          tags: frontmatter.tags,
          cover: frontmatter.cover,
          searchDocument,
          draft: frontmatter.draft,
          publishedAt: new Date(frontmatter.date),
          legacySourcePath: path.relative(cwd, filePath),
        },
        update: {
          title: frontmatter.title,
          desc: frontmatter.desc,
          content: parsed.content,
          category: frontmatter.category,
          tags: frontmatter.tags,
          cover: frontmatter.cover,
          searchDocument,
          draft: frontmatter.draft,
          publishedAt: new Date(frontmatter.date),
          legacySourcePath: path.relative(cwd, filePath),
        },
      })
    }

    console.log(`Imported ${files.length} article(s) from ${path.relative(cwd, articlesDirectory)}.`)
  } finally {
    await prisma.$disconnect()
    await pool.end()
  }
}

await main()
