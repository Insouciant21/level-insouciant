import { mkdtemp, readFile, rm } from "node:fs/promises"
import os from "node:os"
import path from "node:path"

import icoEndec from "ico-endec"
import sharp from "sharp"
import { describe, expect, it } from "vitest"

import {
  generateFaviconAssets,
  getFaviconMetadata,
  writeFaviconAssets,
} from "@/lib/favicon-assets"

const onePixelPng = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
  "base64"
)

describe("favicon asset generation", () => {
  it("generates the supported PNG sizes and a multi-size ICO from a PNG upload", async () => {
    const assets = await generateFaviconAssets(onePixelPng, "archive.png")

    expect([...assets.keys()]).toEqual([
      "favicon.ico",
      "icon-16.png",
      "icon-32.png",
      "icon-48.png",
      "icon-64.png",
      "icon-128.png",
      "icon-180.png",
      "icon-192.png",
      "icon-256.png",
      "icon-512.png",
      "apple-icon.png",
      "icon.png",
    ])
    expect(assets.get("favicon.ico")).toBeInstanceOf(Buffer)
    expect(assets.get("icon-512.png")).toBeInstanceOf(Buffer)
  })

  it("rejects uploads that are not PNG or ICO files", async () => {
    await expect(
      generateFaviconAssets(Buffer.from("not an image"), "archive.txt")
    ).rejects.toThrow("INVALID_FAVICON_UPLOAD")
  })

  it("uses the largest decodable entry when the upload is an ICO", async () => {
    const smallPng = await sharp({
      create: { width: 16, height: 16, channels: 4, background: "#a2c957" },
    })
      .png()
      .toBuffer()
    const largePng = await sharp({
      create: { width: 32, height: 32, channels: 4, background: "#8a4f34" },
    })
      .png()
      .toBuffer()
    const ico = icoEndec.encode([smallPng, largePng])

    const assets = await generateFaviconAssets(ico, "archive.ico")
    const entries = icoEndec.decode(assets.get("favicon.ico")!)

    expect(entries.map((entry) => entry.width)).toEqual([16, 32, 48, 64, 128, 256])
    expect(await sharp(assets.get("icon-512.png")!).metadata()).toMatchObject({
      width: 512,
      height: 512,
    })
  })

  it("replaces a generated directory through a manifest version", async () => {
    const assetDir = await mkdtemp(path.join(os.tmpdir(), "insous-site-icons-"))
    const assets = await generateFaviconAssets(onePixelPng, "archive.png")

    try {
      await writeFaviconAssets(assets, assetDir)
      const firstManifest = await readFile(path.join(assetDir, "manifest.json"), "utf8")

      await writeFaviconAssets(assets, assetDir)
      const secondManifest = await readFile(path.join(assetDir, "manifest.json"), "utf8")

      expect(JSON.parse(firstManifest).version).toBeTruthy()
      expect(JSON.parse(secondManifest).version).toBeTruthy()
      expect(secondManifest).not.toBe(firstManifest)
    } finally {
      await rm(assetDir, { recursive: true, force: true })
    }
  })

  it("builds versioned metadata for all browser icon roles", async () => {
    const metadata = await getFaviconMetadata()

    expect(metadata.icons).toMatchObject({
      shortcut: expect.stringContaining("/site-icons/favicon.ico?v="),
      apple: [
        {
          url: expect.stringContaining("/site-icons/icon-180.png?v="),
          sizes: "180x180",
        },
      ],
    })
    expect(metadata.icons.icon).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          url: expect.stringContaining("/site-icons/icon-32.png?v="),
          sizes: "32x32",
        }),
      ])
    )
  })
})
