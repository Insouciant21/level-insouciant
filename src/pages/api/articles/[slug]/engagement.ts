import type { APIRoute } from "astro"
import * as handlers from "@/server/endpoints/api/articles/[slug]/engagement"
export const GET: APIRoute = (ctx) =>
  handlers.GET(ctx.request, {
    params: Promise.resolve(ctx.params as { slug: string }),
  })
