/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    localPatterns: [{ pathname: "/site-icons/**" }],
  },
  outputFileTracingIncludes: {
    "/*": [
      "node_modules/sharp/**/*",
      "node_modules/.pnpm/@img+sharp-libvips-linux-x64@*/node_modules/@img/sharp-libvips-linux-x64/lib/**/*",
      "node_modules/.pnpm/@img+sharp-linux-x64@*/node_modules/@img/sharp-linux-x64/lib/**/*",
    ],
  },
}

export default nextConfig
