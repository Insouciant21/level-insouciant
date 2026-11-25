import Link from "@/lib/navigation"

import type { getSiteConfig } from "@/lib/site-config"

function SiteFooter({
  siteConfig,
}: {
  siteConfig: Awaited<ReturnType<typeof getSiteConfig>>
}) {
  const footerLinks = siteConfig.footer.links.filter((link) => link.enabled)

  return (
    <footer className="relative z-10 border-t border-border/75 bg-[#c6bd99]/40 pt-7 pb-9 sm:pb-11">
      <div className="mx-auto w-full max-w-[88rem] px-5 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center gap-3">
              <p className="utility-kicker">Exit Registry</p>
              <span className="font-mono text-[0.64rem] tracking-[0.14em] text-muted-foreground/80 uppercase">
                M.E.G. ARCHIVE // NODE ACTIVE
              </span>
            </div>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              {siteConfig.name}
            </h2>
            <p className="max-w-2xl text-sm leading-7 text-foreground/82">
              {siteConfig.description}
            </p>
          </div>

          <nav aria-label="社交与联系入口" className="flex flex-wrap gap-2">
            {footerLinks.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="chrome-pill hover:border-foreground/35 hover:bg-[#d9d1ad]/65 hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
            <a
              href="/rss.xml"
              className="chrome-pill text-muted-foreground hover:border-foreground/35 hover:bg-[#d9d1ad]/65 hover:text-foreground"
            >
              RSS
            </a>
          </nav>
        </div>
      </div>
    </footer>
  )
}

export { SiteFooter }
