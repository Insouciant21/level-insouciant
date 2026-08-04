import { NextResponse } from "next/server"

import { getCurrentAdmin } from "@/lib/auth"
import { createMediaAsset, listMediaAssets } from "@/lib/media/assets"

function getServiceErrorResponse(error: unknown) {
  const code = error instanceof Error ? error.message : "MEDIA_REQUEST_FAILED"

  if (
    code === "INVALID_MEDIA_FILE" ||
    code === "MEDIA_FILE_TOO_LARGE" ||
    code === "INVALID_MEDIA_TYPE"
  ) {
    return NextResponse.json({ error: code }, { status: 400 })
  }

  if (code === "MEDIA_STORAGE_NOT_CONFIGURED") {
    return NextResponse.json({ error: code }, { status: 503 })
  }

  return NextResponse.json({ error: "MEDIA_REQUEST_FAILED" }, { status: 500 })
}

function parseOptionalNumber(value: string | null): number | undefined {
  if (value === null || value.trim() === "") {
    return undefined
  }

  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

export async function GET(request: Request) {
  const admin = await getCurrentAdmin()

  if (!admin) {
    return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 })
  }

  const url = new URL(request.url)
  const status = url.searchParams.get("status")
  const query = url.searchParams.get("query") ?? undefined

  try {
    const result = await listMediaAssets({
      query,
      status:
        status === "linked" || status === "unlinked" || status === "all"
          ? status
          : undefined,
      page: parseOptionalNumber(url.searchParams.get("page")),
      pageSize: parseOptionalNumber(url.searchParams.get("pageSize")),
    })

    return NextResponse.json(result)
  } catch (error) {
    return getServiceErrorResponse(error)
  }
}

export async function POST(request: Request) {
  const admin = await getCurrentAdmin()

  if (!admin) {
    return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 })
  }

  let file: File | null = null

  try {
    const formData = await request.formData()
    const value = formData.get("file")

    if (value instanceof File) {
      file = value
    }
  } catch {
    return NextResponse.json({ error: "INVALID_MEDIA_FILE" }, { status: 400 })
  }

  if (!file) {
    return NextResponse.json({ error: "INVALID_MEDIA_FILE" }, { status: 400 })
  }

  try {
    const asset = await createMediaAsset({
      file,
      uploadedByUserId: admin.id,
    })

    return NextResponse.json(asset, { status: 201 })
  } catch (error) {
    return getServiceErrorResponse(error)
  }
}
