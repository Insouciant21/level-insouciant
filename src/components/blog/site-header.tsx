import Link from "next/link"

import { UserMenu } from "@/components/blog/user-menu"
import { getCurrentUser } from "@/lib/auth"
import { siteConfig } from "@/lib/site"

async function SiteHeader() {
  const user = await getCurrentUser()

  return (
    <header className="sticky top-0 z-40 border-b border-black/10 bg-background/88 backdrop-blur-md">
      <div className="mx-auto w-full max-w-[88rem] px-5 py-5 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start justify-between gap-4 lg:max-w-xl">
            <div className="space-y-2">
              <Link href="/" className="inline-flex items-center gap-3">
                <span className="relative flex size-3 items-center justify-center">
                  <span className="absolute size-3 animate-ping bg-primary/40" />
                  <span className="relative size-2 bg-primary" />
                </span>
                <span className="text-[0.74rem] font-semibold uppercase tracking-[0.3em] text-foreground">
                  {siteConfig.name}
                </span>
              </Link>
              <p className="text-[0.68rem] uppercase tracking-[0.26em] text-muted-foreground">
                Facility Hub // Archive Sync: Online
              </p>
              <p className="max-w-xl text-sm leading-7 text-muted-foreground">
                {siteConfig.description}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4 lg:items-end">
            <nav aria-label="主导航">
              <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[0.74rem] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                {siteConfig.nav.map((item) => (
                  <li key={item.href}>
                    <Link
                      className="border-b border-transparent pb-1 hover:border-foreground/40 hover:text-foreground"
                      href={item.href}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <UserMenu user={user} />
                </li>
              </ul>
            </nav>

            <div className="flex items-center justify-between gap-3 lg:justify-end">
              <span className="chrome-pill hidden sm:inline-flex">
                <span className="size-1.5 bg-primary" />
                Node Stable
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export { SiteHeader }
