import assert from "node:assert/strict"
import { chromium } from "playwright"

const base = process.env.STAGING_BASE_URL ?? "http://127.0.0.1:4322"
const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE,
})

try {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  })
  const page = await context.newPage()
  const response = await page.goto(base + "/articles/tfa-apocalyse", {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  })
  assert.equal(response.status(), 200)

  for (const selector of ["#article-reading-root h1", ".prose-block table"]) {
    const element = page.locator(selector).first()
    await element.waitFor()
    const hiddenAncestors = await element.evaluate((element) => {
      const hidden = []
      for (let node = element; node; node = node.parentElement) {
        const style = getComputedStyle(node)
        if (
          Number(style.opacity) === 0 ||
          style.visibility !== "visible" ||
          style.display === "none"
        ) {
          hidden.push(node.tagName + ": " + node.getAttribute("style"))
        }
      }
      return hidden
    })
    assert.deepEqual(
      hiddenAncestors,
      [],
      selector + " is visible before hydration"
    )
  }

  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth
    )
  )
  console.log("PASS: article heading and table are visible without JavaScript")
} finally {
  await browser.close()
}
