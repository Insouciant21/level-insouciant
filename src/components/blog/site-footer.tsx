import Link from "next/link"

import { siteConfig } from "@/lib/site"

function SiteFooter() {
  return (
    <footer className="relative z-10 border-t border-black/10 pb-8 pt-6 sm:pb-10">
      <div className="mx-auto w-full max-w-[88rem] px-5 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div className="space-y-3">
            <p className="utility-kicker">Exit Registry</p>
            <h2 className="text-3xl font-semibold tracking-tight">{siteConfig.name}</h2>
            <p className="max-w-2xl text-sm leading-7 text-foreground/90">
              {siteConfig.description}
            </p>
            <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
              {siteConfig.footer.closing}
            </p>
          </div>

          <nav aria-label="社交与联系入口" className="flex flex-wrap gap-2">
            {siteConfig.socials.map((item) => (
              <Link
                key={item.href}
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
