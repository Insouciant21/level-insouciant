import assert from "node:assert/strict"
import { randomUUID, scryptSync } from "node:crypto"
import { Pool } from "pg"
import { JSDOM } from "jsdom"
import { chromium } from "playwright"

const base = process.env.STAGING_BASE_URL ?? "http://127.0.0.1:4323"
const database = new URL(process.env.DATABASE_URL)
if (
  process.env.STAGING_WRITE_TESTS !== "1" ||
  !["localhost", "127.0.0.1"].includes(new URL(base).hostname) ||
  !["localhost", "127.0.0.1"].includes(database.hostname) ||
  !database.pathname.endsWith("-staging")
)
  throw new Error("Requires an isolated localhost staging app and database")

const pool = new Pool({ connectionString: database.toString() })
const id = "cache-validation-" + randomUUID()
const slug = id
const adminName = "Cache Validation Administrator"
const email = id + "@example.invalid"
const password = randomUUID()
const salt = randomUUID()
const passwordHash = `scrypt:${salt}:${scryptSync(password, salt, 64).toString("hex")}`
const session = new Map()
const cookies = () =>
  [...session].map(([key, value]) => `${key}=${value}`).join("; ")
const publicPath = "/articles/" + slug
let originalSettings
let browser

async function read(path, { authenticated = false, headers = {} } = {}) {
  const response = await fetch(base + path, {
    headers: { ...(authenticated ? { cookie: cookies() } : {}), ...headers },
    redirect: "manual",
  })
  return { response, html: await response.text() }
}

async function action(name, values, path = "/admin/articles") {
  const response = await fetch(base + path + "?_action=" + name, {
    method: "POST",
    headers: { origin: base, cookie: cookies() },
    body: new URLSearchParams(values),
    redirect: "manual",
  })
  await response.text()
  for (const cookie of response.headers.getSetCookie()) {
    const pair = cookie.split(";", 1)[0]
    const separator = pair.indexOf("=")
    session.set(pair.slice(0, separator), pair.slice(separator + 1))
  }
  assert.equal(response.status, 303, name)
  assert.ok(
    !response.headers.get("location")?.includes("error="),
    `${name} failed`
  )
}

async function cached(path = publicPath, expected = "HIT") {
  const result = await read(path)
  assert.equal(result.response.status, 200, path)
  assert.equal(result.response.headers.get("x-page-cache"), expected, path)
  assert.equal(
    result.response.headers.get("cache-control"),
    "private, no-store"
  )
  assert.ok(!result.response.headers.has("set-cookie"))
  assert.ok(!result.html.includes(adminName))
  return result.html
}

try {
  await pool.query(
    'INSERT INTO "User" (id, email, name, "passwordHash", role, "updatedAt") VALUES ($1, $2, $3, $4, \'ADMIN\', NOW())',
    [id, email, adminName, passwordHash]
  )
  await action("adminLoginAction", { email, password }, "/admin/login")
  assert.ok(session.has("astro-auth.session-token"))

  const values = {
    slug,
    title: "公开页面缓存验证",
    desc: "隔离数据库中的缓存回归测试",
    category: "缓存验证",
    tags: "cache-validation",
    cover: "",
    publishedAt: "2026-10-18",
    intent: "publish",
    content:
      "## 缓存验证\n\nCACHE_VERSION_ONE\n\n| 名称 | 数值 |\n| --- | --- |\n| 测试 | 140 |\n\n## 公式\n\n$$\nx^2+y^2=z^2\n$$\n",
  }
  await action("createArticleAction", values, "/admin/articles/new")
  assert.ok((await cached(publicPath, "MISS")).includes("CACHE_VERSION_ONE"))
  await cached()
  await cached("/articles", "MISS")
  await cached("/articles")
  await cached("/", "MISS")
  await cached("/")

  const loggedIn = await read(publicPath, { authenticated: true })
  assert.equal(loggedIn.response.status, 200)
  assert.ok(!loggedIn.response.headers.has("x-page-cache"))
  assert.ok(loggedIn.html.includes(adminName))
  await cached()
  const returning = await read(publicPath, {
    headers: { cookie: "level_insouciant_behavior_id=visitor" },
  })
  assert.equal(returning.response.headers.get("x-page-cache"), "HIT")
  for (const path of [
    "/account",
    "/admin/dashboard",
    "/api/health",
    "/articles?q=validation",
  ]) {
    const result = await read(path, { authenticated: true })
    assert.ok(!result.response.headers.has("x-page-cache"), path)
  }
  console.log(
    "anonymous cache, returning visitors, and authenticated isolation passed"
  )

  browser = await chromium.launch({
    executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE,
    args: ["--no-sandbox"],
  })
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
  })
  const errors = []
  page.on("pageerror", (error) => errors.push(error.message))
  const navigation = await page.goto(base + publicPath, {
    waitUntil: "networkidle",
  })
  assert.equal(navigation.headers()["x-page-cache"], "HIT")
  assert.equal(await page.locator(".prose-block table").count(), 1)
  assert.equal(await page.locator(".prose-block .katex").count(), 1)
  await page.locator('nav[aria-label="文章目录"]:visible a').last().click()
  await page.waitForURL((url) => Boolean(url.hash))
  assert.deepEqual(errors, [])
  await browser.close()
  browser = undefined
  console.log(
    "cached HTML hydrates, renders tables/math, and supports TOC navigation"
  )

  const comment = await fetch(base + "/api/articles/" + slug + "/comments", {
    method: "POST",
    headers: {
      origin: base,
      cookie: cookies(),
      "content-type": "application/json",
    },
    body: JSON.stringify({ content: "CACHE_DYNAMIC_COMMENT" }),
  })
  assert.equal(comment.status, 201)
  await comment.text()
  const comments = await read("/api/articles/" + slug + "/comments")
  assert.ok(comments.html.includes("CACHE_DYNAMIC_COMMENT"))
  assert.ok(!comments.response.headers.has("x-page-cache"))
  await cached()

  await action("updateArticleAction", {
    ...values,
    content: values.content.replace("CACHE_VERSION_ONE", "CACHE_VERSION_TWO"),
  })
  assert.ok((await cached(publicPath, "MISS")).includes("CACHE_VERSION_TWO"))
  await cached()
  await cached("/articles", "MISS")
  await action("hideArticleAction", { slug })
  const hidden = await read(publicPath)
  assert.equal(hidden.response.status, 404)
  assert.ok(!hidden.response.headers.has("x-page-cache"))
  assert.ok(!(await cached("/articles", "MISS")).includes(slug))
  await action("publishArticleAction", { slug })
  await cached(publicPath, "MISS")
  await cached()
  console.log(
    "dynamic comments, edits, hiding and publishing invalidate correctly"
  )

  await cached("/tags/cache-validation", "MISS")
  await cached("/tags/cache-validation")
  await action("renameTagAction", {
    sourceTag: "cache-validation",
    targetTag: "cache-renamed",
  })
  assert.equal((await read("/tags/cache-validation")).response.status, 404)
  await cached("/tags/cache-renamed", "MISS")
  await action("removeTagAction", { sourceTag: "cache-renamed" })
  assert.equal((await read("/tags/cache-renamed")).response.status, 404)

  const revision = await pool.query(
    'SELECT id FROM "ArticleRevision" WHERE "articleId" = (SELECT id FROM "Article" WHERE slug = $1) ORDER BY "createdAt" ASC LIMIT 1',
    [slug]
  )
  await action("restoreArticleRevisionAction", {
    slug,
    revisionId: revision.rows[0].id,
  })
  assert.ok((await cached(publicPath, "MISS")).includes("CACHE_VERSION_ONE"))
  const settings = await read("/admin/settings", { authenticated: true })
  originalSettings = new JSDOM(settings.html).window.document.querySelector(
    'input[name="settings"]'
  ).value
  const updatedSettings = JSON.stringify({
    ...JSON.parse(originalSettings),
    name: "CACHE_SITE_NAME",
  })
  await action(
    "updateSiteSettingsAction",
    { settings: updatedSettings },
    "/admin/settings"
  )
  assert.ok((await cached(publicPath, "MISS")).includes("CACHE_SITE_NAME"))
  await cached()
  await action("deleteArticleAction", { slug })
  assert.equal((await read(publicPath)).response.status, 404)
  assert.ok(!(await cached("/articles", "MISS")).includes(slug))
  console.log(
    "tags, revision restore, settings, and deletion refresh public pages"
  )
} finally {
  if (browser) await browser.close()
  if (originalSettings)
    await action(
      "updateSiteSettingsAction",
      { settings: originalSettings },
      "/admin/settings"
    )
  await pool.query('DELETE FROM "Article" WHERE slug = $1', [slug])
  await pool.query('DELETE FROM "User" WHERE id = $1', [id])
  await pool.end()
}
