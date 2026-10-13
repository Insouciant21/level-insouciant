import { chromium } from "playwright"
import assert from "node:assert/strict"
import { randomUUID } from "node:crypto"
const base = process.env.STAGING_BASE_URL ?? "http://127.0.0.1:4322"
if (!["localhost", "127.0.0.1"].includes(new URL(base).hostname))
  throw new Error("Write tests require an isolated localhost staging instance")
if (process.env.STAGING_WRITE_TESTS !== "1")
  throw new Error(
    "Set STAGING_WRITE_TESTS=1 only for a database copy with isolated media"
  )
const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE,
  args: ["--no-sandbox"],
})
const admin = await browser.newContext({})
const page = await admin.newPage()
const errors = []
page.on("pageerror", (e) => errors.push(e.message))
const slug = "astro-validation-" + Date.now()
const source =
  "## 测试表格\n\n| 名称 | 内容 |\n| --- | --- |\n| 条目 | 已保存 |\n\n## 公式 $x^2$\n\n$$\nx^2+y^2=z^2\n$$\n\n```js\nconst value = 1\n```\n\n## 重复\n\n## 重复\n"
async function action(context, name, form, path = "/admin/articles") {
  const r = await context.request.post(base + path + "?_action=" + name, {
    form,
    headers: { origin: base },
    maxRedirects: 0,
  })
  assert.equal(r.status(), 303, `${name}: ${r.status()} ${await r.text()}`)
  assert.ok(!r.headers().location?.includes("error="), r.headers().location)
  return r.headers().location
}
try {
  await page.goto(base + "/admin/login", {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  })
  await page.locator("[name=email]").fill(process.env.ADMIN_EMAIL)
  await page.locator("[name=password]").fill(process.env.ADMIN_PASSWORD)
  await page.locator("button[type=submit]").click()
  await page.waitForURL("**/admin/dashboard", { waitUntil: "domcontentloaded" })
  const values = {
    slug,
    title: "Astro验证文章",
    desc: "独立测试库迁移验收",
    category: "迁移测试",
    tags: "astro验证, 表格",
    cover: "",
    publishedAt: "2026-10-13",
    content: source,
    intent: "draft",
  }
  await action(admin, "createArticleAction", values, "/admin/articles/new")
  assert.equal(
    (await admin.request.get(base + "/articles/" + slug)).status(),
    404
  )
  console.log("draft remains private")
  await action(admin, "publishArticleAction", { slug })
  await page.goto(base + "/articles/" + slug, {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  })
  await page.waitForTimeout(1000)
  assert.equal(await page.locator(".prose-block table").count(), 1)
  assert.equal(await page.locator(".prose-block .katex").count(), 2)
  console.log("published table and math")
  await page.goto(base + "/admin/articles/" + slug + "/edit", {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  })
  await page.waitForTimeout(1800)
  const visual = page.locator(".tiptap")
  await visual.waitFor({ timeout: 30000 })
  assert.equal(await visual.locator("table").count(), 1)
  await visual.locator("td").first().click()
  await page.getByRole("button", { name: "表格", exact: true }).click()
  await page
    .getByRole("menuitem", { name: "在下方插入行", exact: true })
    .click()
  assert.equal(await visual.locator("tr").count(), 3)
  await page.getByRole("button", { name: "表格", exact: true }).click()
  await page
    .getByRole("menuitem", { name: "在右侧插入列", exact: true })
    .click()
  assert.equal(await visual.locator("tr").first().locator("th,td").count(), 3)
  const content = await page.locator("input[name=content]").inputValue()
  assert.ok(content.includes("|"))
  await page.getByRole("button", { name: "发布更新", exact: true }).click()
  await page.waitForURL("**/*notice=article-published", {
    waitUntil: "domcontentloaded",
  })
  await page.reload({ waitUntil: "domcontentloaded" })
  await page.locator(".tiptap").waitFor({ timeout: 30000 })
  assert.equal(await page.locator(".tiptap tr").count(), 3)
  console.log("editor table row/column save and reload")
  await page.goto(base + "/admin/articles/" + slug + "/history", {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  })
  const revisionId = await page
    .locator("input[name=revisionId]")
    .last()
    .inputValue()
  await action(admin, "restoreArticleRevisionAction", { slug, revisionId })
  await action(admin, "publishArticleAction", { slug })
  const restored = await admin.request.get(base + "/articles/" + slug)
  assert.ok((await restored.text()).includes("已保存"))
  console.log("history restored")
  assert.ok(
    (
      await (
        await admin.request.get(
          base + "/api/search?q=" + encodeURIComponent("Astro验证文章")
        )
      ).text()
    ).includes(slug)
  )
  const user = await browser.newContext()
  const userPage = await user.newPage()
  const email = "astro-" + randomUUID() + "@example.invalid"
  const password = randomUUID()
  await userPage.goto(base + "/register", {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  })
  await userPage.locator("[name=name]").fill("测试读者")
  await userPage.locator("[name=email]").fill(email)
  await userPage.locator("[name=password]").fill(password)
  await userPage.locator("button[type=submit]").click()
  await userPage.waitForURL(base + "/", {
    timeout: 60000,
    waitUntil: "domcontentloaded",
  })
  assert.equal(
    (await user.request.get(base + "/api/admin/media")).status(),
    401
  )
  const denied = await action(user, "deleteArticleAction", { slug })
  assert.equal(denied, "/account")
  console.log("registered user cannot perform admin writes")
  const commentResponse = await user.request.post(
    base + "/api/articles/" + slug + "/comments",
    { data: { content: "迁移测试评论" }, headers: { origin: base } }
  )
  assert.equal(commentResponse.status(), 201)
  const { comment } = await commentResponse.json()
  const like = await user.request.post(
    base + "/api/articles/" + slug + "/engagement/like",
    { headers: { origin: base } }
  )
  assert.equal(like.status(), 200)
  await action(admin, "hideCommentAction", { commentId: comment.id, slug })
  await action(admin, "approveCommentAction", { commentId: comment.id, slug })
  await action(
    user,
    "deleteOwnCommentAction",
    { commentId: comment.id },
    "/account"
  )
  console.log("comments moderation and likes")
  const upload = await admin.request.post(base + "/api/admin/media", {
    multipart: {
      file: {
        name: "astro.png",
        mimeType: "image/png",
        buffer: Buffer.from(
          "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aZZkAAAAASUVORK5CYII=",
          "base64"
        ),
      },
    },
    headers: { origin: base },
  })
  assert.equal(upload.status(), 201, await upload.text())
  const asset = await upload.json()
  assert.equal(
    (
      await admin.request.patch(base + "/api/admin/media/" + asset.id, {
        data: { displayName: "迁移测试图片" },
        headers: { origin: base },
      })
    ).status(),
    200
  )
  assert.equal(
    (
      await admin.request.delete(base + "/api/admin/media/" + asset.id, {
        headers: { origin: base },
      })
    ).status(),
    200
  )
  console.log("isolated S3 media upload rename delete")
  await action(
    user,
    "updateProfileAction",
    { name: "更新后的读者", email, avatarUrl: "" },
    "/account"
  )
  await action(
    user,
    "changePasswordAction",
    {
      currentPassword: password,
      nextPassword: password + "new",
      confirmPassword: password + "new",
    },
    "/account"
  )
  await action(admin, "renameTagAction", {
    sourceTag: "astro验证",
    targetTag: "astro验证改名",
  })
  await action(admin, "removeTagAction", { sourceTag: "astro验证改名" })
  await page.goto(base + "/admin/settings", {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  })
  const settings = await page.locator('input[name="settings"]').inputValue()
  await action(
    admin,
    "updateSiteSettingsAction",
    { settings },
    "/admin/settings"
  )
  console.log("profile, password, tags and settings")
  await action(user, "logoutAction", { redirectTo: "/" }, "/account")
  assert.equal(
    (
      await user.request.post(
        base + "/api/articles/" + slug + "/engagement/like",
        { headers: { origin: base } }
      )
    ).status(),
    401
  )
  await action(
    user,
    "userLoginAction",
    { email, password: password + "new", redirectTo: "/account" },
    "/login"
  )
  assert.equal(
    (await user.request.get(base + "/account", { maxRedirects: 0 })).status(),
    200
  )
  await action(user, "logoutAction", { redirectTo: "/" }, "/account")
  await action(admin, "deleteArticleAction", { slug })
  assert.equal(
    (await admin.request.get(base + "/articles/" + slug)).status(),
    404
  )
  assert.deepEqual(errors, [])
  console.log("PASS workflow suite", slug)
} finally {
  await browser.close()
}
