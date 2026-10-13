import type { APIRoute } from "astro"
import * as handlers from "@/server/endpoints/api/admin/articles/[slug]/revisions/[revisionId]"
export const GET: APIRoute = (ctx) =>
  handlers.GET(ctx.request, {
    params: Promise.resolve(ctx.params as { slug: string; revisionId: string }),
  })
