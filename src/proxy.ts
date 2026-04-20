import { NextResponse } from "next/server"

import { auth } from "@/auth"

export default auth((request) => {
  const pathname = request.nextUrl.pathname
  const user = request.auth?.user

  if (pathname === "/admin/login") {
    if (!user) {
      return NextResponse.next()
    }

    return NextResponse.redirect(
      new URL(user.role === "ADMIN" ? "/admin/dashboard" : "/account", request.url)
    )
  }

  if (pathname === "/admin") {
    if (!user) {
      return NextResponse.redirect(new URL("/login?next=/account", request.url))
    }

    return NextResponse.redirect(
      new URL(user.role === "ADMIN" ? "/admin/dashboard" : "/account", request.url)
    )
  }

  if (!user) {
    return NextResponse.redirect(new URL("/admin/login", request.url))
  }

  if (user.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/account", request.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/admin/:path*"],
}
