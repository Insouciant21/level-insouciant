import { defineMiddleware } from "astro:middleware"
import { getActionContext } from "astro:actions"
import { publicPageCache } from "./server/public-page-cache"
import {
  HttpSignal,
  requestStorage,
  safeRedirect,
} from "./server/request-context"

export const onRequest = defineMiddleware(async (context, next) => {
  const { request, url } = context
  if (!["GET", "HEAD", "OPTIONS"].includes(request.method)) {
    const origin = request.headers.get("origin")
    if (
      origin !== url.origin ||
      request.headers.get("sec-fetch-site") === "cross-site"
    ) {
      return new Response("Forbidden origin", { status: 403 })
    }
  }
  const render = () =>
    requestStorage.run(
      { context, memo: new Map(), headers: new Headers() },
      async () => {
        let response: Response
        try {
          const { action, setActionResult, serializeActionResult } =
            getActionContext(context)
          if (action?.calledFrom === "form") {
            const result = await action.handler()
            if (result.error)
              return new Response("表单提交失败", {
                status: result.error.status,
              })
            const data = result.data as { redirectTo?: string } | undefined
            if (data?.redirectTo)
              response = context.redirect(safeRedirect(data.redirectTo), 303)
            else {
              setActionResult(action.name, serializeActionResult(result))
              response = await next()
            }
          } else response = await next()
        } catch (error) {
          if (!(error instanceof HttpSignal)) throw error
          response = error.location
            ? context.redirect(safeRedirect(error.location), 303)
            : await context.rewrite("/404")
        }
        const headers = new Headers(response.headers)
        for (const cookie of requestStorage.getStore()!.headers.getSetCookie())
          headers.append("set-cookie", cookie)
        headers.set("cache-control", "private, no-store")
        headers.set("x-content-type-options", "nosniff")
        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers,
        })
      }
    )
  return process.env.NODE_ENV === "production" &&
    process.env.PUBLIC_PAGE_CACHE !== "0"
    ? publicPageCache.respond(request, render)
    : render()
})
