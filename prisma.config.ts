import "dotenv/config"
import { defineConfig } from "prisma/config"

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Prisma's migration engine may not support the connection pooler URL.
    // Keep DATABASE_URL for the app runtime and use DIRECT_URL for migrations
    // when the provider supplies a direct PostgreSQL endpoint.
    url: process.env.DIRECT_URL || process.env.DATABASE_URL,
  },
})
