import { chromium } from "playwright"
import assert from "node:assert/strict"

const base = process.env.STAGING_BASE_URL ?? "http://127.0.0.1:4322"
const checkAdmin = Boolean(
  process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD
)
if (
  checkAdmin &&
  !["localhost", "127.0.0.1"].includes(new URL(base).hostname)
) {
  throw new Error("Admin checks require an isolated localhost staging instance")
}
const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE,
})

async function checkScrollbar(page, region, name) {
  await region.waitFor()
  await page.waitForFunction(
    (element) => element.classList.contains("ps--active-y"),
    await region.elementHandle(),
    { timeout: 30000 }
  )
  await region.evaluate((element) => {
    element.scrollTop = 0
  })
  const rail = region.locator(":scope > .ps__rail-y")
  const thumb = rail.locator(".ps__thumb-y")
  assert.equal(await rail.count(), 1, `${name}: one rail`)
  assert.equal(
    await region.evaluate((el) => getComputedStyle(el).overflowY),
    "hidden"
  )
  assert.equal(
    await region.evaluate((el) => getComputedStyle(el).scrollbarWidth),
    "none"
  )
  assert.equal(
    await region.evaluate(
      (el) => getComputedStyle(el, "::-webkit-scrollbar").display
    ),
    "none"
  )

  await page.mouse.move(0, 0)
  await page.waitForFunction(
    (el) => getComputedStyle(el).width === "3px",
    await thumb.elementHandle(),
    { timeout: 5000 }
  )
  assert.equal(await rail.evaluate((el) => getComputedStyle(el).width), "9px")
  assert.equal(await thumb.evaluate((el) => getComputedStyle(el).width), "3px")
  await thumb.hover()
  await page.waitForFunction(
    (el) => getComputedStyle(el).width === "5px",
    await thumb.elementHandle(),
    { timeout: 5000 }
  )
  assert.equal(
    await rail.evaluate((el) => getComputedStyle(el).backgroundColor),
    "rgba(0, 0, 0, 0)"
  )
  assert.equal(await thumb.evaluate((el) => getComputedStyle(el).width), "5px")
  assert.notEqual(
    await thumb.evaluate((el) => getComputedStyle(el).backgroundColor),
    "rgb(153, 153, 153)"
  )
  await region.screenshot({ path: `/tmp/scrollbar-${name}.png` })

  const box = await thumb.boundingBox()
  const pageScroll = await page.evaluate(() => scrollY)
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
  await page.mouse.down()
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2 + 80, {
    steps: 8,
  })
  await page.mouse.up()
  assert.ok(
    await region.evaluate((el) => el.scrollTop > 0),
    `${name}: thumb drags`
  )
  assert.equal(await page.evaluate(() => scrollY), pageScroll)

  await region.evaluate((el) => {
    el.scrollTop = 0
  })
  const regionBox = await region.boundingBox()
  await page.mouse.move(regionBox.x + regionBox.width / 2, regionBox.y + 50)
  await page.mouse.wheel(0, 200)
  await page.waitForTimeout(250)
  assert.ok(
    await region.evaluate((el) => el.scrollTop > 0),
    `${name}: wheel scrolls`
  )
  assert.equal(await page.evaluate(() => scrollY), pageScroll)
  console.log(
    `PASS ${name}: themed idle/hover, no native scrollbar, drag and independent wheel`
  )
}

async function waitForOverflow(page, region, active) {
  await page.waitForFunction(
    ({ element, active }) =>
      element.classList.contains("ps--active-y") === active,
    { element: await region.elementHandle(), active },
    { timeout: 5000 }
  )
  assert.equal(
    await region
      .locator(":scope > .ps__rail-y")
      .evaluate((el) => getComputedStyle(el).display),
    active ? "block" : "none"
  )
}

try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  const errors = []
  page.on("pageerror", (error) => errors.push(error.message))
  await page.goto(base + "/articles/tfa-apocalyse", {
    waitUntil: "domcontentloaded",
  })
  const toc = page.getByRole("region", { name: "文章目录滚动区域" })
  await checkScrollbar(page, toc, "toc")
  await toc.focus()
  await toc.evaluate((el) => {
    el.scrollTop = 0
  })
  await page.keyboard.press("ArrowDown")
  assert.ok(
    await toc.evaluate((el) => el.scrollTop > 0),
    "TOC keyboard scrolling"
  )

  if (checkAdmin) {
    await page.goto(base + "/admin/login")
    await page.locator("[name=email]").fill(process.env.ADMIN_EMAIL)
    await page.locator("[name=password]").fill(process.env.ADMIN_PASSWORD)
    await page.locator("button[type=submit]").click()
    await page.waitForURL("**/admin/dashboard")
    // Load at a short height to exercise the sidebar's own scroll region.
    await page.setViewportSize({ width: 1440, height: 600 })
    await page.reload({ waitUntil: "domcontentloaded" })
    const sidebar = page.locator('[aria-label="后台侧栏"]')
    await checkScrollbar(page, sidebar, "sidebar")
    await page.setViewportSize({ width: 1440, height: 1200 })
    await waitForOverflow(page, sidebar, false)
    await sidebar.hover()
    assert.equal(
      await sidebar.locator(":scope > .ps__rail-y").isVisible(),
      false
    )
    await page.setViewportSize({ width: 1440, height: 600 })
    await waitForOverflow(page, sidebar, true)
    await page.setViewportSize({ width: 1440, height: 1200 })
    await waitForOverflow(page, sidebar, false)
    await page.getByRole("navigation", { name: "后台导航" }).evaluate((el) => {
      const extra = document.createElement("div")
      extra.dataset.scrollbarValidation = ""
      extra.style.height = "1300px"
      el.appendChild(extra)
    })
    await waitForOverflow(page, sidebar, true)
    await page
      .locator("[data-scrollbar-validation]")
      .evaluate((el) => el.remove())
    await waitForOverflow(page, sidebar, false)
    console.log(
      "PASS sidebar: hides without overflow, updates after viewport and content changes"
    )
    // Fractional CSS heights reproduce browser zoom / display scaling rounding.
    for (const height of [1199.5, 1199.75, 1199.25]) {
      await sidebar.evaluate((el, height) => {
        el.style.flex = "none"
        el.style.height = `${height}px`
      }, height)
      await page.waitForTimeout(250)
      const dimensions = await sidebar.evaluate((el) => {
        el.scrollTop = 10000
        const maxScroll = el.scrollTop
        el.scrollTop = 0
        return {
          maxScroll,
          content: el.scrollHeight,
          viewport: el.clientHeight,
        }
      })
      assert.equal(dimensions.maxScroll, 0)
      assert.equal(dimensions.content, dimensions.viewport)
      await waitForOverflow(page, sidebar, false)
      await sidebar.hover()
      assert.equal(
        await sidebar.locator(":scope > .ps__rail-y").isVisible(),
        false
      )
    }
    await sidebar.evaluate((el) => el.removeAttribute("style"))
    await page.setViewportSize({ width: 1440, height: 600 })
    await waitForOverflow(page, sidebar, true)
    console.log(
      "PASS sidebar: fractional heights hide a zero-range scrollbar, true overflow remains scrollable"
    )
    await page.goto(base + "/admin/articles/new")
    await page.waitForFunction(
      () =>
        [...document.querySelectorAll('astro-island[client="load"]')].every(
          (el) => !el.hasAttribute("ssr")
        ),
      {},
      { timeout: 60000 }
    )
    await page.getByRole("button", { name: "源码", exact: true }).click()
    await page.locator(".cm-content").waitFor()
    await page
      .locator(".cm-content")
      .fill(Array.from({ length: 100 }, (_, i) => `第 ${i + 1} 行`).join("\n"))
    await checkScrollbar(page, page.locator(".cm-scroller"), "source-editor")
  }
  assert.deepEqual(errors, [])
} finally {
  await browser.close()
}
