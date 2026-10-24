import { createRequire } from "node:module"

// @vercel/og 1.x ships an esbuild ESM bundle whose internal require shim
// only works when a bundler re-bundles it (fs, harfbuzzjs). Load it through
// native Node require so those CJS dependencies resolve in Astro dev SSR;
// the pnpm patch on the package provides the require binding it needs.
const require = createRequire(import.meta.url)

export const { ImageResponse } = require("@vercel/og") as {
  ImageResponse: typeof import("@vercel/og").ImageResponse
}
