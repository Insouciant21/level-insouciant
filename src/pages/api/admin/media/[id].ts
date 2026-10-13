import type { APIRoute } from "astro"
import * as handlers from "@/server/endpoints/api/admin/media/[id]"
export const GET: APIRoute = (ctx) =>
  handlers.GET(ctx.request, {
    params: Promise.resolve(ctx.params as { id: string }),
  })
export const PATCH: APIRoute = (ctx) =>
  handlers.PATCH(ctx.request, {
    params: Promise.resolve(ctx.params as { id: string }),
  })
export const DELETE: APIRoute = (ctx) =>
  handlers.DELETE(ctx.request, {
    params: Promise.resolve(ctx.params as { id: string }),
  })
