import { chromium } from "playwright"
import assert from "node:assert/strict"
const base = process.env.STAGING_BASE_URL ?? "http://127.0.0.1:4322"
if (!["localhost", "127.0.0.1"].includes(new URL(base).hostname)) {
  throw new Error("Use an isolated localhost staging instance")
}
const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE,
})
try {
  const page = await browser.newPage()
  const errors = []
  const requests = []
  page.on("pageerror", (error) => errors.push(error.message))
  page.on("request", (request) => requests.push(request.url()))
  await page.goto(base + "/admin/login")
  await page.locator("[name=email]").fill(process.env.ADMIN_EMAIL)
  await page.locator("[name=password]").fill(process.env.ADMIN_PASSWORD)
  await page.locator("button[type=submit]").click()
  await page.waitForURL("**/admin/dashboard")
  let release
  const gate = new Promise((resolve) => {
    release = resolve
  })
  await page.route("**/article-rich-editor.*.js", async (route) => {
    await gate
    await route.continue()
  })
  await page.goto(base + "/admin/articles/new")
  await page.getByText("正在加载编辑器…", { exact: true }).waitFor()
  await page.locator("[name=title]").fill("加载期间填写的标题")
  assert.equal(await page.locator(".tiptap").count(), 0)
  release()
  await page.locator(".tiptap").waitFor()
  assert.equal(
    await page.locator("[name=title]").inputValue(),
    "加载期间填写的标题"
  )
  assert.equal(
    requests.some((url) => /\/mdx-editor\.[^/]+\.js/.test(url)),
    false
  )
  await page.locator(".tiptap").fill("正文保留测试")
  await page.getByRole("button", { name: "源码", exact: true }).click()
  await page.locator(".cm-content").waitFor()
  assert.ok(
    (await page.locator(".cm-content").innerText()).includes("正文保留测试")
  )
  await page.getByRole("button", { name: "可视化", exact: true }).click()
  await page.locator(".tiptap").waitFor()
  assert.equal(await page.locator(".tiptap").innerText(), "正文保留测试")
  assert.deepEqual(errors, [])
  console.log(
    "PASS delayed editor, responsive metadata, on-demand source loading and content round trip"
  )

  // A separate page has a fresh module cache, allowing a real failed download.
  const failed = await browser.newPage({
    storageState: await page.context().storageState(),
  })
  await failed.route("**/article-rich-editor.*.js", (route) => route.abort())
  await failed.goto(base + "/admin/articles/new")
  await failed.getByRole("textbox", { name: "临时源码编辑器" }).waitFor()
  await failed.locator("[name=title]").fill("失败后保留标题")
  await failed
    .getByRole("textbox", { name: "临时源码编辑器" })
    .fill("## 网络失败仍可编辑")
  assert.equal(
    await failed.locator("input[name=content]").inputValue(),
    "## 网络失败仍可编辑"
  )
  assert.equal(
    await failed.locator("[name=title]").inputValue(),
    "失败后保留标题"
  )
  console.log(
    "PASS failed download preserves metadata and allows source editing"
  )
} finally {
  await browser.close()
}
