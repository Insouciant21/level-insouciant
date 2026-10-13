import type { APIRoute } from "astro"
import image from "@/server/article-opengraph-image"
export const GET: APIRoute = ({ params }) =>
  image({ params: Promise.resolve({ slug: params.slug! }) })
