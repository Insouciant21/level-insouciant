import { chromium } from "playwright"
import assert from "node:assert/strict"
const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE,
})
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await page.goto(
    (process.env.STAGING_BASE_URL ?? "http://127.0.0.1:4322") +
      "/articles/tfa-apocalyse",
    { waitUntil: "domcontentloaded", timeout: 60000 }
  )
  const region = page.getByRole("region", { name: "文章目录滚动区域" })
  await region.waitFor({ timeout: 20000 })
  const card = page
    .getByRole("navigation", { name: "文章目录" })
    .filter({ has: region })
  const heading = card.getByRole("heading", { name: "目录", exact: true })
  await page.waitForFunction(
    () =>
      document
        .querySelector('[aria-label="文章目录滚动区域"]')
        ?.classList.contains("ps"),
    {},
    { timeout: 30000 }
  )
  assert.ok(
    await region.evaluate(
      (el) =>
        el.classList.contains("ps") && el.classList.contains("ps--active-y")
    )
  )
  assert.equal(
    await region.evaluate((el) => getComputedStyle(el).overflowY),
    "hidden"
  )
  assert.equal(await region.locator(".ps__rail-y").count(), 1)
  await page.evaluate(() => window.scrollTo(0, 1200))
  await page.waitForTimeout(400)
  const cardBox = await card.boundingBox()
  const box = await region.boundingBox()
  const headingBefore = await heading.boundingBox()
  assert.ok(Math.abs(cardBox.y - 128) < 4)
  assert.ok(cardBox.height <= 756)
  assert.ok(box.y > headingBefore.y + headingBefore.height)
  await page.mouse.move(box.x + 100, box.y + 100)
  await page.mouse.wheel(0, 4000)
  await page.waitForTimeout(400)
  assert.equal(await page.evaluate(() => window.scrollY), 1200)
  assert.ok(await region.evaluate((el) => el.scrollTop > 0))
  const headingAfter = await heading.boundingBox()
  assert.ok(
    Math.abs(headingAfter.y - headingBefore.y) < 1,
    "TOC heading stays fixed"
  )
  assert.equal(
    await card.getByText("Known Index", { exact: true }).isVisible(),
    true
  )
  await card.screenshot({ path: "/tmp/astro-toc-fixed-header.png" })
  await region.getByRole("link", { name: "天气后效", exact: true }).click()
  await page.waitForTimeout(800)
  assert.equal(
    await page.evaluate(() => decodeURIComponent(location.hash)),
    "#天气后效"
  )
  console.log(
    JSON.stringify({
      title: await page.title(),
      toc: await region.evaluate((el) => ({
        scrollTop: el.scrollTop,
        height: el.clientHeight,
        totalHeight: el.scrollHeight,
      })),
      anchor: await page
        .locator('[id="天气后效"]')
        .evaluate((el) => el.getBoundingClientRect().top),
    })
  )
  await page.screenshot({ path: "/tmp/astro-toc-desktop.png" })
  await page.setViewportSize({ width: 390, height: 844 })
  await page.waitForTimeout(300)
  assert.equal(await region.isVisible(), false)
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth
    )
  )
  console.log(
    "PASS: fixed TOC heading, independent desktop scrolling, bottom anchor, mobile layout"
  )
} finally {
  await browser.close()
}
