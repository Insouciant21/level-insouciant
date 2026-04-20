import { NextResponse } from "next/server"

import { searchArticles } from "@/lib/content"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q")?.trim() ?? ""

  if (!query) {
    return NextResponse.json({ results: [] })
  }

  try {
    const results = await searchArticles(query)
    return NextResponse.json({ results })
  } catch {
    return NextResponse.json({ error: "SEARCH_FAILED" }, { status: 500 })
  }
}
