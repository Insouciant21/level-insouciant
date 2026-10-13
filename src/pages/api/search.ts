import type { APIRoute } from "astro"
import * as handlers from "@/server/endpoints/api/search"
export const GET: APIRoute = (ctx) => handlers.GET(ctx.request)
