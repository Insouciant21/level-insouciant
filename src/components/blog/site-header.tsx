import Link from "next/link"

import { ThemeToggle } from "@/components/blog/theme-toggle"
import { UserMenu } from "@/components/blog/user-menu"
import { getCurrentUser } from "@/lib/auth"
import { siteConfig } from "@/lib/site"

async function SiteHeader() {
  const user = await getCurrentUser()

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-5 py-4 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start justify-between gap-4 md:flex-1">
          <div className="space-y-1">
            <Link href="/" className="text-base font-semibold tracking-tight">
              {siteConfig.name}
            </Link>
            <p className="max-w-xl text-sm text-muted-foreground">{siteConfig.description}</p>
          </div>
          <div className="md:hidden">
            <ThemeToggle />
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 md:justify-end">
          <nav aria-label="主导航">
            <ul className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
              {siteConfig.nav.map((item) => (
                <li key={item.href}>
                  <Link className="transition hover:text-foreground" href={item.href}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <UserMenu user={user} />
          <div className="hidden md:block">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  )
}

export { SiteHeader }
