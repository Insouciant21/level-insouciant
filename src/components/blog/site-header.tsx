import Link from "next/link"

import { UserMenu } from "@/components/blog/user-menu"
import { MobileNav } from "@/components/blog/mobile-nav"
import { getCurrentUser } from "@/lib/auth"
import { siteConfig } from "@/lib/site"

async function SiteHeader() {
  const user = await getCurrentUser()

  return (
    <header className="site-header-shell sticky top-0 z-40 overflow-visible bg-background/88 backdrop-blur-md">
      <div className="mx-auto w-full max-w-[88rem] px-5 py-5 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start justify-between gap-4 lg:max-w-xl">
            <div className="space-y-2">
              <Link href="/" className="utility-brand-link">
                <span className="signal-beacon" aria-hidden="true">
                  <span className="signal-beacon__halo" />
                  <span className="signal-beacon__core" />
                </span>
                <span className="text-[0.74rem] font-semibold tracking-[0.3em] text-foreground uppercase">
                  {siteConfig.name}
                </span>
              </Link>
              <p className="text-[0.68rem] tracking-[0.26em] text-muted-foreground uppercase">
                Facility Hub // Archive Sync: Online
              </p>
              <p className="max-w-xl text-sm leading-7 text-muted-foreground">
                {siteConfig.description}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4 lg:items-end">
            <div className="flex justify-end md:hidden">
              <MobileNav user={user} />
            </div>

            <nav aria-label="主导航" className="hidden md:block">
              <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[0.74rem] font-semibold tracking-[0.28em] text-muted-foreground uppercase">
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
      </div>
    </header>
  )
}

export { SiteHeader }
