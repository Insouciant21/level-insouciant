import type { APIRoute } from "astro"
import * as handlers from "@/server/endpoints/api/articles/[slug]/engagement/like"
export const POST: APIRoute = (ctx) =>
  handlers.POST(ctx.request, {
    params: Promise.resolve(ctx.params as { slug: string }),
  })
