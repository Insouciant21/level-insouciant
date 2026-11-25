import type { APIRoute } from "astro"
import { handleArticleMcp } from "@/server/article-mcp"

export const ALL: APIRoute = ({ request }) => handleArticleMcp(request)
