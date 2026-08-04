import Link from "next/link"

import { UserMenu } from "@/components/blog/user-menu"
import { MobileNav } from "@/components/blog/mobile-nav"
import { getCurrentUser } from "@/lib/auth"
import { getSiteConfig } from "@/lib/site-config"

async function SiteHeader() {
  const [user, siteConfig] = await Promise.all([
    getCurrentUser(),
    getSiteConfig(),
  ])

  return (
    <header className="site-header-shell sticky top-0 z-40 overflow-visible border-b backdrop-blur-sm">
      <div className="mx-auto grid w-full max-w-[88rem] grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-5 px-5 py-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-4 justify-self-start">
          <Link href="/" className="utility-brand-link shrink-0">
            <span className="signal-beacon" aria-hidden="true">
              <span className="signal-beacon__halo" />
              <span className="signal-beacon__core" />
            </span>
            <span className="text-[0.74rem] font-semibold tracking-[0.3em] text-foreground uppercase">
              {siteConfig.name}
            </span>
          </Link>
          <p className="hidden max-w-xl truncate border-l border-border/70 pl-4 text-sm text-muted-foreground lg:block">
            {siteConfig.description}
          </p>
        </div>

        <nav
          aria-label="主导航"
          className="hidden justify-self-center md:block"
        >
          <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[0.74rem] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
            {siteConfig.nav.map((item) => (
              <li key={item.href}>
                <Link className="utility-nav-link" href={item.href}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex shrink-0 items-center gap-3 justify-self-end">
          <span className="site-status-pill hidden lg:inline-flex">
            <span
              className="size-1.5 rounded-full bg-primary"
              aria-hidden="true"
            />
            Archive Sync
          </span>

          <div className="md:hidden">
            <MobileNav
              user={user}
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
