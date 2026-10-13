import { defineConfig } from "astro/config"
import node from "@astrojs/node"
import react from "@astrojs/react"
import tailwind from "@tailwindcss/vite"
import { fileURLToPath } from "node:url"

export default defineConfig({
  output: "server",
  adapter: node({ mode: "standalone", bodySizeLimit: 55 * 1024 * 1024 }),
  integrations: [react()],
  vite: {
    plugins: [tailwind()],
    resolve: {
      alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
    },
  },
  security: {
    checkOrigin: true,
    allowedDomains: [
      { hostname: "blog.moeblue.top" },
      { hostname: "localhost" },
      { hostname: "127.0.0.1" },
    ],
  },
})
