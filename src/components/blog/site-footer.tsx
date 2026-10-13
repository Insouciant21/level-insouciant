import Link from "@/lib/navigation"

import type { getSiteConfig } from "@/lib/site-config"

function SiteFooter({ siteConfig }: {siteConfig: Awaited<ReturnType<typeof getSiteConfig>>}) {
  const footerLinks = siteConfig.footer.links.filter((link) => link.enabled)

  return (
    <footer className="relative z-10 border-t border-border/70 pt-6 pb-8 sm:pb-10">
      <div className="mx-auto w-full max-w-[88rem] px-5 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div className="space-y-3">
            <p className="utility-kicker">Exit Registry</p>
            <h2 className="text-3xl font-semibold tracking-tight">
              {siteConfig.name}
            </h2>
            <p className="max-w-2xl text-sm leading-7 text-foreground/90">
              {siteConfig.description}
            </p>
          </div>

          <nav aria-label="社交与联系入口" className="flex flex-wrap gap-2">
            {footerLinks.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="chrome-pill hover:border-foreground/25 hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  )
}

export { SiteFooter }
