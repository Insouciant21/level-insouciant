import type { APIRoute } from "astro"
import * as handlers from "@/server/endpoints/api/admin/media"
export const GET: APIRoute = (ctx) => handlers.GET(ctx.request)
export const POST: APIRoute = (ctx) => handlers.POST(ctx.request)
