import type { APIRoute } from "astro"
import { Auth } from "@auth/core"
import { authConfig } from "@/auth"
export const ALL: APIRoute = ({ request }) => Auth(request, authConfig)
