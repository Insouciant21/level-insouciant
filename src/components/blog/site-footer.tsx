import Link from "next/link"

import { siteConfig } from "@/lib/site"

function SiteFooter() {
  return (
    <footer className="border-t border-border/70">
      <div className="mx-auto grid w-full max-w-7xl gap-6 px-5 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">
            {siteConfig.name} · {siteConfig.description}
          </p>
          <p className="text-sm text-muted-foreground">{siteConfig.footer.closing}</p>
        </div>

        <nav aria-label="社交与联系入口" className="flex flex-wrap gap-3">
          {siteConfig.socials.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full border border-border/70 px-4 py-2 text-sm text-muted-foreground transition hover:border-primary/50 hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  )
}

export { SiteFooter }
