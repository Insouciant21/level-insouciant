import Link from "@/lib/navigation"
import {
  Contact,
  ExternalLink,
  FileStack,
  Link as LinkIcon,
  Radio,
  Zap,
} from "lucide-react"
import { MotionReveal } from "@/components/motion/page-transition"
import { PageShell } from "@/components/blog/page-shell"
import { contactIconByKind } from "@/lib/contact-kinds"
import type { load } from "@/server/pages/about-index"
import { IslandProvider } from "@/components/providers/island-provider"

const aboutArticleClass =
  "public-summary-panel-document px-6 py-7 sm:px-10 sm:py-9"
const aboutQuoteClass =
  "border-l-[3px] border-[#8a4f34]/80 bg-[#d9d1ad]/60 px-5 py-4 font-serif text-xl font-semibold italic text-foreground shadow-[inset_0_1px_0_rgba(255,252,225,0.18)] sm:text-2xl"
const aboutHighlightClass =
  "public-summary-card-muted px-5 py-4 transition duration-200 hover:border-foreground/28 hover:bg-[#d9d1ad]/58"
const aboutAccessLinkClass =
  "flex items-center justify-between border-b border-[#73766f]/45 pb-2.5 transition duration-200 hover:border-[#8a4f34]/60 hover:text-destructive"

function isExternalHttpHref(href: string) {
  try {
    const url = new URL(href)
    return url.protocol === "http:" || url.protocol === "https:"
  } catch {
    return false
  }
}

function View({ siteConfig, contactItems }: Awaited<ReturnType<typeof load>>) {
  return (
    <PageShell>
      <section className="grid gap-10 lg:grid-cols-[320px_minmax(0,1fr)] lg:items-start">
        <MotionReveal variant="left" duration={0.34}>
          <aside className="grid gap-6 lg:sticky lg:top-28">
            <div className="space-y-4 border-l-[3px] border-foreground/75 pl-4 lg:border-r-[3px] lg:border-l-0 lg:pr-5 lg:pl-0">
              <p className="utility-kicker">Official Designation</p>
              <h1 className="text-4xl font-semibold tracking-tight uppercase sm:text-5xl">
                {siteConfig.about.displayTitle}
              </h1>
              <p className="font-mono text-xs leading-7 text-muted-foreground">
                <span className="block">
                  Archive Node: {siteConfig.about.archiveNodeLabel}
                </span>
                <span className="block">
                  {siteConfig.about.statusLabel}: {siteConfig.about.statusValue}
                </span>
              </p>
            </div>

            <div className="terminal-panel rounded-[0.25rem] border p-5 text-[#d9d1ad]">
              <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between border-b border-primary/20 pb-3 font-mono text-[0.65rem] tracking-[0.2em] text-[#9aa79a] uppercase">
                  <span className="inline-flex items-center gap-2 text-[var(--safety-exit-green-strong)]">
                    <Radio className="size-3.5" aria-hidden="true" />
                    M.E.G. BEACON
                  </span>
                  <span>NODE ACTIVE</span>
                </div>

                <div className="grid grid-cols-3 gap-2 py-2 font-mono text-[0.65rem] tracking-[0.14em] uppercase">
                  <div className="border border-white/10 bg-black/25 px-2.5 py-2">
                    <span className="block text-[#748073]">LVL</span>
                    <span className="mt-1 block text-[#edf3e9]">00-IN</span>
                  </div>
                  <div className="border border-white/10 bg-black/25 px-2.5 py-2">
                    <span className="block text-[#748073]">LIGHT</span>
                    <span className="mt-1 block text-[#edf3e9]">60Hz</span>
                  </div>
                  <div className="border border-white/10 bg-black/25 px-2.5 py-2">
                    <span className="block text-[#748073]">CLASS</span>
                    <span className="mt-1 block text-[var(--safety-exit-green-strong)]">
                      SAFE
                    </span>
                  </div>
                </div>

                <p className="font-mono text-[0.68rem] leading-6 text-[#9aa79a]">
                  记录边界、坐标与留存之物。所有公开条目均处于持续校准中。
                </p>
              </div>
            </div>

            <div className="grid gap-3.5 font-mono text-sm text-muted-foreground">
              <Link
                href={siteConfig.about.archiveAccess.href}
                className={aboutAccessLinkClass}
              >
                <span className="text-xs font-semibold tracking-[0.22em] uppercase">
                  {siteConfig.about.archiveAccess.label}
                </span>
                <FileStack className="size-4" aria-hidden="true" />
              </Link>
              <Link
                href={siteConfig.about.transmission.href}
                className={aboutAccessLinkClass}
              >
                <span className="text-xs font-semibold tracking-[0.22em] uppercase">
                  {siteConfig.about.transmission.label}
                </span>
                <Zap className="size-4" aria-hidden="true" />
              </Link>
            </div>
          </aside>
        </MotionReveal>

        <MotionReveal variant="right" duration={0.34} delay={0.06}>
          <article className={aboutArticleClass}>
            <p className={aboutQuoteClass}>{siteConfig.about.quote}</p>

            <div className="mt-8 space-y-6 text-base leading-8 text-foreground/86">
              <p>{siteConfig.about.intro}</p>
              <p>{siteConfig.about.principles}</p>
            </div>

            <div className="mt-10">
              <h2 className="flex items-center gap-3 border-b border-foreground/65 pb-3 text-xl font-semibold tracking-[0.18em] uppercase">
                <Contact className="size-5 text-destructive" />
                {siteConfig.about.contactHeading}
              </h2>

              <ul className="mt-5 grid gap-3">
                {contactItems.map((contact) => {
                  const Icon = contactIconByKind[contact.kind] ?? LinkIcon
                  const external = isExternalHttpHref(contact.href)

                  return (
                    <li key={contact.id} className={aboutHighlightClass}>
                      <div className="grid gap-2.5 md:grid-cols-[180px_minmax(0,1fr)] md:items-center">
                        <div className="flex items-center gap-2 font-mono text-xs font-semibold tracking-[0.14em] text-foreground/82 uppercase">
                          <Icon
                            className="size-4 shrink-0 text-primary"
                            aria-hidden="true"
                          />
                          <span>{contact.label}</span>
                        </div>
                        <a
                          href={contact.href}
                          target={external ? "_blank" : undefined}
                          rel={external ? "noreferrer" : undefined}
                          className="inline-flex min-w-0 items-center gap-2 text-sm leading-7 break-all text-foreground/82 underline decoration-foreground/25 underline-offset-4 transition hover:text-destructive"
                        >
                          <span>{contact.value}</span>
                          <ExternalLink
                            className="size-3.5 shrink-0"
                            aria-hidden="true"
                          />
                        </a>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </div>
          </article>
        </MotionReveal>
      </section>
    </PageShell>
  )
}

export default function Page(
  props: Awaited<ReturnType<typeof load>> & { location: string }
) {
  return (
    <IslandProvider location={props.location}>
      <View {...props} />
    </IslandProvider>
  )
}
