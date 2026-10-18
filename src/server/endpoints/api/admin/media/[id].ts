import { getCurrentAdmin } from "@/lib/auth"
import {
  deleteMediaAsset,
  getMediaAssetDetails,
  renameMediaAsset,
  retryMediaAssetDeletion,
} from "@/lib/media/assets"

type RouteProps = {
  params: Promise<{
    id: string
  }>
}

function getServiceErrorResponse(error: unknown) {
  const code = error instanceof Error ? error.message : "MEDIA_REQUEST_FAILED"

  if (
    code === "INVALID_MEDIA_DISPLAY_NAME" ||
    code === "INVALID_MEDIA_FILE" ||
    code === "MEDIA_FILE_TOO_LARGE" ||
    code === "INVALID_MEDIA_TYPE"
  ) {
    return Response.json({ error: code }, { status: 400 })
  }

  if (code === "MEDIA_ASSET_NOT_FOUND") {
    return Response.json({ error: code }, { status: 404 })
  }

  if (
    code === "MEDIA_ASSET_NOT_AVAILABLE" ||
    code === "MEDIA_ASSET_NOT_RETRYABLE" ||
    code === "MEDIA_REFERENCE_REWRITE_FAILED"
  ) {
    return Response.json({ error: code }, { status: 409 })
  }

  if (code === "MEDIA_STORAGE_NOT_CONFIGURED") {
    return Response.json({ error: code }, { status: 503 })
  }

  return Response.json({ error: "MEDIA_REQUEST_FAILED" }, { status: 500 })
}

export async function GET(_request: Request, { params }: RouteProps) {
  const admin = await getCurrentAdmin()

  if (!admin) {
    return Response.json({ error: "AUTH_REQUIRED" }, { status: 401 })
  }

  const { id } = await params

  try {
    const asset = await getMediaAssetDetails(id)

    if (!asset) {
      return Response.json({ error: "MEDIA_ASSET_NOT_FOUND" }, { status: 404 })
    }

    return Response.json(asset)
  } catch (error) {
    return getServiceErrorResponse(error)
  }
}

export async function PATCH(request: Request, { params }: RouteProps) {
  const admin = await getCurrentAdmin()

  if (!admin) {
    return Response.json({ error: "AUTH_REQUIRED" }, { status: 401 })
  }

  const { id } = await params
  let displayName: unknown

  try {
    const body = await request.json()
    displayName = body?.displayName
  } catch {
    return Response.json(
      { error: "INVALID_MEDIA_DISPLAY_NAME" },
      { status: 400 }
    )
  }

  if (typeof displayName !== "string") {
    return Response.json(
      { error: "INVALID_MEDIA_DISPLAY_NAME" },
      { status: 400 }
    )
  }

  try {
    const asset = await renameMediaAsset(id, displayName)
    return Response.json(asset)
  } catch (error) {
    return getServiceErrorResponse(error)
  }
}

export async function DELETE(request: Request, { params }: RouteProps) {
  const admin = await getCurrentAdmin()

  if (!admin) {
    return Response.json({ error: "AUTH_REQUIRED" }, { status: 401 })
  }

  const { id } = await params
  const url = new URL(request.url)
  const isRetry = url.searchParams.get("retry") === "1"

  try {
    const result = isRetry
      ? await retryMediaAssetDeletion(id)
      : await deleteMediaAsset(id, admin.id)

    return Response.json(result)
  } catch (error) {
    return getServiceErrorResponse(error)
  }
}
