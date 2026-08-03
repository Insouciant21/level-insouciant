import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises"
import path from "node:path"
import { randomUUID } from "node:crypto"

import icoEndec from "ico-endec"
import sharp from "sharp"

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024
const MAX_SOURCE_DIMENSION = 4_096
const MAX_ICO_ENTRIES = 32
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
const ICO_SIZES = [16, 32, 48, 64, 128, 256] as const
const PNG_SIZES = [16, 32, 48, 64, 128, 180, 192, 256, 512] as const
const MANIFEST_FILENAME = "manifest.json"

export const FAVICON_ASSET_DIR = path.join(process.cwd(), "public", "site-icons")

export const FAVICON_URLS = {
  favicon: "/site-icons/favicon.ico",
  icon: "/site-icons/icon-512.png",
  apple: "/site-icons/icon-180.png",
  icon16: "/site-icons/icon-16.png",
  icon32: "/site-icons/icon-32.png",
  icon48: "/site-icons/icon-48.png",
  icon64: "/site-icons/icon-64.png",
  icon128: "/site-icons/icon-128.png",
  icon180: "/site-icons/icon-180.png",
  icon192: "/site-icons/icon-192.png",
  icon256: "/site-icons/icon-256.png",
  icon512: "/site-icons/icon-512.png",
} as const

type FaviconAssetMap = Map<string, Buffer>

function invalidUpload(): Error {
  return new Error("INVALID_FAVICON_UPLOAD")
}

function hasSignature(buffer: Buffer, signature: Buffer) {
  return buffer.subarray(0, signature.length).equals(signature)
}

function isIcoBuffer(buffer: Buffer) {
  return (
    buffer.length >= 6 &&
    buffer.readUInt16LE(0) === 0 &&
    buffer.readUInt16LE(2) === 1 &&
    buffer.readUInt16LE(4) > 0 &&
    buffer.readUInt16LE(4) <= MAX_ICO_ENTRIES
  )
}

function validateDimensions(width: number | undefined, height: number | undefined) {
  if (
    !width ||
    !height ||
    width < 1 ||
    height < 1 ||
    width > MAX_SOURCE_DIMENSION ||
    height > MAX_SOURCE_DIMENSION
  ) {
    throw invalidUpload()
  }
}

function bmpToPng(buffer: Buffer, width: number, height: number) {
  if (buffer.subarray(0, 2).toString("ascii") !== "BM") {
    throw invalidUpload()
  }

  const pixelOffset = buffer.readUInt32LE(10)
  const bitsPerPixel = buffer.readUInt16LE(28)
  const compression = buffer.readUInt32LE(30)

  if (![24, 32].includes(bitsPerPixel) || compression !== 0) {
    throw invalidUpload()
  }

  const rowStride = Math.ceil((bitsPerPixel * width) / 32) * 4
  const pixelEnd = pixelOffset + rowStride * height

  if (pixelEnd > buffer.length) {
    throw invalidUpload()
  }

  const topDown = buffer.readInt32LE(22) < 0
  const rgba = Buffer.alloc(width * height * 4)
  let alphaIsEmpty = bitsPerPixel === 32

  for (let y = 0; y < height; y += 1) {
    const sourceY = topDown ? y : height - y - 1
    const sourceRow = pixelOffset + sourceY * rowStride

    for (let x = 0; x < width; x += 1) {
      const sourceOffset = sourceRow + x * (bitsPerPixel / 8)
      const targetOffset = (y * width + x) * 4
      rgba[targetOffset] = buffer[sourceOffset + 2]
      rgba[targetOffset + 1] = buffer[sourceOffset + 1]
      rgba[targetOffset + 2] = buffer[sourceOffset]
      rgba[targetOffset + 3] = bitsPerPixel === 32 ? buffer[sourceOffset + 3] : 255

      if (bitsPerPixel === 32 && rgba[targetOffset + 3] !== 0) {
        alphaIsEmpty = false
      }
    }
  }

  if (alphaIsEmpty) {
    for (let offset = 3; offset < rgba.length; offset += 4) {
      rgba[offset] = 255
    }
  }

  return sharp(rgba, {
    raw: { width, height, channels: 4 },
  })
    .png()
    .toBuffer()
}

async function resolveSourcePng(input: Buffer, extension: string) {
  if (extension === ".png") {
    const metadata = await sharp(input).metadata().catch(() => null)
    validateDimensions(metadata?.width, metadata?.height)
    return sharp(input).png().toBuffer()
  }

  let entries

  try {
    entries = icoEndec.decode(input)
  } catch {
    throw invalidUpload()
  }

  if (entries.length === 0 || entries.length > MAX_ICO_ENTRIES) {
    throw invalidUpload()
  }

  const usableEntries = entries
    .filter((entry) => entry.imageType === "png" || entry.imageType === "bmp")
    .sort((left, right) => right.width * right.height - left.width * left.height)

  for (const entry of usableEntries) {
    try {
      validateDimensions(entry.width, entry.height)
      const source =
        entry.imageType === "png"
          ? entry.imageData
          : await bmpToPng(entry.imageData, entry.width, entry.height)
      const metadata = await sharp(source).metadata()
      validateDimensions(metadata.width, metadata.height)
      return sharp(source).png().toBuffer()
    } catch (error) {
      if (error instanceof Error && error.message === "INVALID_FAVICON_UPLOAD") {
        continue
      }
    }
  }

  throw invalidUpload()
}

export async function generateFaviconAssets(
  input: Buffer,
  filename: string
): Promise<FaviconAssetMap> {
  if (input.length === 0 || input.length > MAX_UPLOAD_BYTES) {
    throw invalidUpload()
  }

  const extension = path.extname(filename).toLowerCase()
  const isPng = extension === ".png" && hasSignature(input, PNG_SIGNATURE)
  const isIco = extension === ".ico" && isIcoBuffer(input)

  if (!isPng && !isIco) {
    throw invalidUpload()
  }

  const sourcePng = await resolveSourcePng(input, extension)
  const pngAssets = new Map<number, Buffer>()

  for (const size of PNG_SIZES) {
    pngAssets.set(
      size,
      await sharp(sourcePng)
        .resize(size, size, {
          fit: "contain",
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .png()
        .toBuffer()
    )
  }

  const assets: FaviconAssetMap = new Map()
  assets.set(
    "favicon.ico",
    icoEndec.encode(ICO_SIZES.map((size) => pngAssets.get(size)!))
  )

  for (const size of PNG_SIZES) {
    assets.set(`icon-${size}.png`, pngAssets.get(size)!)
  }

  assets.set("apple-icon.png", pngAssets.get(180)!)
  assets.set("icon.png", pngAssets.get(512)!)

  return assets
}

function createVersion() {
  return `${Date.now().toString(36)}-${randomUUID().slice(0, 8)}`
}

export async function writeFaviconAssets(
  assets: FaviconAssetMap,
  assetDir: string
) {
  const parentDir = path.dirname(assetDir)
  const stagingDir = path.join(parentDir, `.site-icons-staging-${randomUUID()}`)
  const backupDir = path.join(parentDir, `.site-icons-backup-${randomUUID()}`)
  let movedExisting = false

  try {
    await mkdir(parentDir, { recursive: true })
    await mkdir(stagingDir, { recursive: true })

    for (const [filename, content] of assets) {
      await writeFile(path.join(stagingDir, filename), content, { flag: "wx" })
    }

    await writeFile(
      path.join(stagingDir, MANIFEST_FILENAME),
      JSON.stringify({ version: createVersion() })
    )

    try {
      await rename(assetDir, backupDir)
      movedExisting = true
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
        throw error
      }
    }

    await rename(stagingDir, assetDir)
    await rm(backupDir, { recursive: true, force: true })
  } catch (error) {
    await rm(stagingDir, { recursive: true, force: true })
    await rm(assetDir, { recursive: true, force: true })

    if (movedExisting) {
      await rename(backupDir, assetDir).catch(() => undefined)
    }

    throw error
  } finally {
    await rm(stagingDir, { recursive: true, force: true })
    await rm(backupDir, { recursive: true, force: true })
  }
}

export async function saveFaviconUpload(file: File | null): Promise<void> {
  if (!file || file.size === 0 || file.size > MAX_UPLOAD_BYTES) {
    throw invalidUpload()
  }

  const input = Buffer.from(await file.arrayBuffer())
  const assets = await generateFaviconAssets(input, file.name)

  await writeFaviconAssets(assets, FAVICON_ASSET_DIR)
}

function addVersion(url: string, version: string) {
  return `${url}?v=${encodeURIComponent(version)}`
}

export async function getFaviconMetadata() {
  let version = "default"

  try {
    const manifest = JSON.parse(
      await readFile(path.join(FAVICON_ASSET_DIR, MANIFEST_FILENAME), "utf8")
    ) as { version?: unknown }

    if (typeof manifest.version === "string" && /^[a-z0-9-]+$/i.test(manifest.version)) {
      version = manifest.version
    }
  } catch {
    // The checked-in assets remain valid when the local manifest is unavailable.
  }

  const urls = Object.fromEntries(
    Object.entries(FAVICON_URLS).map(([key, url]) => [key, addVersion(url, version)])
  ) as typeof FAVICON_URLS

  return {
    version,
    urls,
    icons: {
      icon: [
        { url: urls.icon16, type: "image/png", sizes: "16x16" },
        { url: urls.icon32, type: "image/png", sizes: "32x32" },
        { url: urls.icon48, type: "image/png", sizes: "48x48" },
        { url: urls.icon64, type: "image/png", sizes: "64x64" },
        { url: urls.icon128, type: "image/png", sizes: "128x128" },
        { url: urls.icon192, type: "image/png", sizes: "192x192" },
        { url: urls.icon256, type: "image/png", sizes: "256x256" },
        { url: urls.icon512, type: "image/png", sizes: "512x512" },
      ],
      shortcut: urls.favicon,
      apple: [{ url: urls.apple, type: "image/png", sizes: "180x180" }],
    },
  }
}
