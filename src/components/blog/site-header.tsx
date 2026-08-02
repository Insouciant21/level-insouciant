import Link from "next/link"

import { UserMenu } from "@/components/blog/user-menu"
import { MobileNav } from "@/components/blog/mobile-nav"
import { getCurrentUser } from "@/lib/auth"
import { siteConfig } from "@/lib/site"

async function SiteHeader() {
  const user = await getCurrentUser()

  return (
    <header className="site-header-shell sticky top-0 z-40 overflow-visible border-b border-border/70 bg-background/92 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-[88rem] items-center justify-between gap-5 px-5 py-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-4">
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

        <div className="flex shrink-0 items-center gap-3">
          <span className="site-status-pill hidden lg:inline-flex">
            <span
              className="size-1.5 rounded-full bg-primary"
              aria-hidden="true"
            />
            Archive Sync
          </span>

          <div className="md:hidden">
            <MobileNav user={user} />
          </div>

          <nav aria-label="主导航" className="hidden md:block">
            <ul className="flex flex-wrap items-center justify-end gap-x-5 gap-y-2 text-[0.74rem] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
              {siteConfig.nav.map((item) => (
                <li key={item.href}>
                  <Link className="utility-nav-link" href={item.href}>
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <UserMenu user={user} />
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  )
}

export { SiteHeader }
