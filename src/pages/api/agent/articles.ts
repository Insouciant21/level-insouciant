import type { APIRoute } from "astro"
import { handleAgentRequest } from "@/server/agent-articles"

export const POST: APIRoute = ({ request }) => handleAgentRequest(request)
