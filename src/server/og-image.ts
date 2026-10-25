import { createRequire } from "node:module"
import { existsSync, readFileSync } from "node:fs"
import { dirname, join } from "node:path"

type SatoriOptions = Parameters<typeof import("satori").default>[1]
type SatoriFont = NonNullable<SatoriOptions>["fonts"][number]
type SatoriElement = Parameters<typeof import("satori").default>[0]

const require = createRequire(import.meta.url)

// satori and @resvg/resvg-wasm mix ESM/CJS internals that Vite's dev module
// runner cannot execute reliably; load them through native require instead.
const satori = require("satori").default as typeof import("satori").default
const { Resvg, initWasm } =
  require("@resvg/resvg-wasm") as typeof import("@resvg/resvg-wasm")

let wasmPromise: Promise<void> | undefined
let fontsPromise: Promise<SatoriFont[]> | undefined

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength
  ) as ArrayBuffer
}

function barlowFontPath(weight: 400 | 700): string {
  const pkg = require.resolve("@fontsource/barlow-condensed/package.json")
  return join(
    dirname(pkg),
    "files",
    `barlow-condensed-latin-${weight}-normal.woff`
  )
}

function notoFontPath(): string {
  // Dev serves from the repo root; the standalone production server serves
  // the public directory from dist/client.
  const candidates = [
    "public/fonts/NotoSansSC-Regular.otf",
    "dist/client/fonts/NotoSansSC-Regular.otf",
  ]
  const found = candidates.find((candidate) => existsSync(candidate))
  if (!found) {
    throw new Error(
      "Noto Sans SC font file not found (expected public/fonts/NotoSansSC-Regular.otf)"
    )
  }
  return found
}

function ensureWasm(): Promise<void> {
  wasmPromise ??= initWasm(
    toArrayBuffer(
      readFileSync(require.resolve("@resvg/resvg-wasm/index_bg.wasm"))
    )
  )
  return wasmPromise
}

function loadFonts(): Promise<SatoriFont[]> {
  fontsPromise ??= Promise.all([
    // Barlow Condensed covers Latin glyphs, Noto Sans SC falls back for CJK.
    readFileSync(barlowFontPath(400)),
    readFileSync(barlowFontPath(700)),
    readFileSync(notoFontPath()),
  ]).then(
    ([regular, bold, noto]) =>
      [
        {
          name: "Barlow Condensed",
          data: toArrayBuffer(regular),
          weight: 400,
          style: "normal",
        },
        {
          name: "Barlow Condensed",
          data: toArrayBuffer(bold),
          weight: 700,
          style: "normal",
        },
        {
          name: "Noto Sans SC",
          data: toArrayBuffer(noto),
          weight: 400,
          style: "normal",
        },
      ] as SatoriFont[]
  )
  return fontsPromise
}

export async function createOgImageResponse(
  element: SatoriElement,
  options: {
    width: number
    height: number
    headers?: Record<string, string>
  }
): Promise<Response> {
  const [svg] = await Promise.all([
    satori(element, {
      width: options.width,
      height: options.height,
      fonts: await loadFonts(),
    }),
    ensureWasm(),
  ])
  const png = new Resvg(svg).render().asPng()
  return new Response(toArrayBuffer(png), {
    headers: {
      "content-type": "image/png",
      ...options.headers,
    },
  })
}
