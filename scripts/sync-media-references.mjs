import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@prisma/client"
import { Pool } from "pg"

import {
  normalizeAssetUrl,
  syncArticleMediaReferences,
} from "./media-reference-sync.mjs"

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required.")
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  })
  const adapter = new PrismaPg(pool)
  const prisma = new PrismaClient({ adapter })

  try {
    const [assets, articles] = await Promise.all([
      prisma.mediaAsset.findMany({
        where: { status: { not: "DELETING" } },
        select: { id: true, publicUrl: true },
      }),
      prisma.article.findMany({
        select: { id: true, content: true, cover: true },
      }),
    ])

    const assetIdByNormalizedUrl = new Map(
      assets.map((asset) => [normalizeAssetUrl(asset.publicUrl), asset.id])
    )

    for (const article of articles) {
      await syncArticleMediaReferences(prisma, article, assetIdByNormalizedUrl)
    }

    console.log(
      `Synced media references for ${articles.length} article(s) against ${assets.length} asset(s).`
    )
  } finally {
    await prisma.$disconnect()
    await pool.end()
  }
}

await main()
