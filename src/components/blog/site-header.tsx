import * as React from "react"
import Link from "@/lib/navigation"

import { UserMenu } from "@/components/blog/user-menu"
import { MobileNav } from "@/components/blog/mobile-nav"
import type { getCurrentUser } from "@/lib/auth"
import type { getSiteConfig } from "@/lib/site-config"

function getPathnameFromLocation(location: string) {
  try {
    return new URL(location, "http://localhost").pathname
  } catch {
    return "/"
  }
}

function isNavItemActive(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/"
  }

  return pathname === href || pathname.startsWith(`${href}/`)
}

function SiteHeader({
  user,
  siteConfig,
  location = "/",
}: {
  user: Awaited<ReturnType<typeof getCurrentUser>>
  siteConfig: Awaited<ReturnType<typeof getSiteConfig>>
  location?: string
}) {
  const [pathname, setPathname] = React.useState(() =>
    getPathnameFromLocation(location)
  )

  React.useEffect(() => {
    setPathname(getPathnameFromLocation(location))
  }, [location])

  React.useEffect(() => {
    function syncPathname() {
      setPathname(window.location.pathname || "/")
    }

    document.addEventListener("astro:page-load", syncPathname)
    window.addEventListener("popstate", syncPathname)

    return () => {
      document.removeEventListener("astro:page-load", syncPathname)
      window.removeEventListener("popstate", syncPathname)
    }
  }, [])

  React.useEffect(() => {
    function handleQuickSearchShortcut(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null
      const isEditable =
        Boolean(target) &&
        (target?.tagName === "INPUT" ||
          target?.tagName === "TEXTAREA" ||
          target?.tagName === "SELECT" ||
          target?.isContentEditable)

      if (isEditable) {
        return
      }

      const isSlash =
        event.key === "/" && !event.metaKey && !event.ctrlKey && !event.altKey
      const isCmdK =
        (event.metaKey || event.ctrlKey) &&
        event.key.toLowerCase() === "k" &&
        !event.altKey

      if (!isSlash && !isCmdK) {
        return
      }

      event.preventDefault()

      if (window.location.pathname === "/search") {
        const input = document.getElementById(
          "archive-search-query"
        ) as HTMLInputElement | null
        input?.focus()
        return
      }

      const searchNavLink = document.querySelector<HTMLAnchorElement>(
        'header a[href="/search"]'
      )

      if (searchNavLink) {
        searchNavLink.click()
      } else {
        window.location.assign("/search")
      }
    }

    window.addEventListener("keydown", handleQuickSearchShortcut)
    return () =>
      window.removeEventListener("keydown", handleQuickSearchShortcut)
  }, [])

  return (
    <header className="site-header-shell sticky top-0 z-40 overflow-visible border-b backdrop-blur-sm">
      <div className="mx-auto grid w-full max-w-[88rem] grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-3.5 sm:px-6 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:px-8">
        <div className="flex min-w-0 items-center gap-3 justify-self-start">
          <Link href="/" className="utility-brand-link min-w-0 shrink-0">
            <span className="signal-beacon shrink-0" aria-hidden="true">
              <span className="signal-beacon__halo" />
              <span className="signal-beacon__core" />
            </span>
            <span className="truncate font-mono text-[0.76rem] font-medium tracking-[0.24em] text-foreground uppercase">
              {siteConfig.name}
            </span>
          </Link>
        </div>

        <nav
          aria-label="主导航"
          className="hidden justify-self-center md:block"
        >
          <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[0.76rem] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
            {siteConfig.nav.map((item) => {
              const active = isNavItemActive(pathname, item.href)

              return (
                <li key={item.href}>
                  <Link
                    className="utility-nav-link"
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                  >
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="flex shrink-0 items-center gap-2.5 justify-self-end">
          <span className="site-status-pill hidden xl:inline-flex">
            <span className="size-1.5 bg-primary" aria-hidden="true" />
            Archive Sync
          </span>

          <div className="md:hidden">
            <MobileNav
              user={user}
              pathname={pathname}
              config={{ name: siteConfig.name, nav: siteConfig.nav }}
            />
          </div>

          <div className="hidden md:block">
            <UserMenu user={user} />
          </div>
        </div>
      </div>
    </header>
  )
}

export { SiteHeader }
