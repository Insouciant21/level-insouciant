import { describe, expect, it } from "vitest"

import prismaConfig from "./prisma.config"

describe("Prisma configuration", () => {
  it("loads the Prisma config module without relying on a transitive dotenv dependency", () => {
    expect(prismaConfig.schema).toBe("prisma/schema.prisma")
    expect(prismaConfig.migrations?.path).toBe("prisma/migrations")
  })
})
