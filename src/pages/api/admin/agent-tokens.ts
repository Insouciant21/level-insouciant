import type { APIRoute } from "astro"
import * as handlers from "@/server/endpoints/api/admin/agent-tokens"

export const GET: APIRoute = () => handlers.GET()
export const POST: APIRoute = ({ request }) => handlers.POST(request)
export const DELETE: APIRoute = ({ request }) => handlers.DELETE(request)
