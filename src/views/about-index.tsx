import Link from "@/lib/navigation"
import {
  Anchor,
  Contact,
  ExternalLink,
  FileStack,
  Link as LinkIcon,
  Zap,
} from "lucide-react"
import { MotionReveal } from "@/components/motion/page-transition"
import { PageShell } from "@/components/blog/page-shell"
import { contactIconByKind } from "@/lib/contact-kinds"
const aboutArticleClass =
  "public-summary-panel-document px-7 py-8 sm:px-10 sm:py-10"
const aboutQuoteClass =
  "border-l-4 border-[#8a4f34]/80 bg-[#d9d1ad]/52 px-5 py-4 text-2xl font-semibold italic text-foreground shadow-[inset_0_1px_0_rgba(255,252,225,0.16)]"
const aboutHighlightClass =
  "public-summary-card-muted px-5 py-4 transition duration-700 hover:border-foreground/20 hover:bg-[#d9d1ad]/48"
const aboutWarningHighlightClass =
  "border border-[#8a4f34]/70 bg-[#181b17] px-5 py-4 text-[#d9d1ad] shadow-[inset_0_1px_0_rgba(255,252,225,0.08),0_18px_38px_-30px_rgba(0,0,0,0.46)]"
const aboutAccessLinkClass =
  "flex items-center justify-between border-b border-[#73766f]/42 pb-2 transition duration-500 hover:border-[#8a4f34]/48 hover:text-destructive"
function isExternalHttpHref(href: string) {
  try {
    const url = new URL(href)
    return url.protocol === "http:" || url.protocol === "https:"
  } catch {
    return false
  }
}
import type { load } from "@/server/pages/about-index"
import { IslandProvider } from "@/components/providers/island-provider"
function View({ siteConfig, contactItems }: Awaited<ReturnType<typeof load>>) {
  return (
    <PageShell>
      <section className="grid gap-10 lg:grid-cols-[320px_minmax(0,1fr)] lg:items-start">
        <MotionReveal variant="left">
          <aside className="grid gap-8 lg:sticky lg:top-28">
            <div className="space-y-4 border-r-4 border-foreground/80 pr-6">
              <p className="utility-kicker">Official Designation</p>
              <h1 className="text-5xl font-semibold tracking-tight uppercase">
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

            <div className="flex h-56 items-center justify-center bg-[#1a1a1a] text-[#4a4a4a] shadow-[inset_0_0_30px_rgba(0,0,0,0.8)]">
              <Anchor className="size-24" />
            </div>

            <div className="grid gap-4 font-mono text-sm text-muted-foreground">
              <Link
                href={siteConfig.about.archiveAccess.href}
                className={aboutAccessLinkClass}
              >
                <span className="font-semibold tracking-[0.24em] uppercase">
                  {siteConfig.about.archiveAccess.label}
                </span>
                <FileStack className="size-4" />
              </Link>
              <Link
                href={siteConfig.about.transmission.href}
                className={aboutAccessLinkClass}
              >
                <span className="font-semibold tracking-[0.24em] uppercase">
                  {siteConfig.about.transmission.label}
                </span>
                <Zap className="size-4" />
              </Link>
            </div>
          </aside>
        </MotionReveal>

        <MotionReveal variant="right" delay={0.3}>
          <article className={aboutArticleClass}>
            <p className={aboutQuoteClass}>{siteConfig.about.quote}</p>

            <div className="mt-8 space-y-6 text-base leading-8 text-foreground/84">
              <p>{siteConfig.about.intro}</p>
              <p>{siteConfig.about.principles}</p>
            </div>

            <div className="mt-12">
              <h2 className="flex items-center gap-3 border-b-2 border-foreground/80 pb-3 text-xl font-semibold tracking-[0.2em] uppercase">
                <Contact className="size-5 text-destructive" />
                {siteConfig.about.contactHeading}
              </h2>

              <ul className="mt-6 grid gap-4">
                {contactItems.map((contact, index) => {
                  const isWarning = index === contactItems.length - 1
                  const Icon = contactIconByKind[contact.kind] ?? LinkIcon
                  const external = isExternalHttpHref(contact.href)

                  return (
                    <li
                      key={contact.id}
                      className={
                        isWarning
                          ? aboutWarningHighlightClass
                          : aboutHighlightClass
                      }
                    >
                      <div className="grid gap-3 md:grid-cols-[180px_minmax(0,1fr)] md:items-center">
                        <div
                          className={
                            isWarning
                              ? "flex items-center gap-2 text-sm font-semibold tracking-[0.16em] text-[#d9d1ad]"
                              : "flex items-center gap-2 text-sm font-semibold tracking-[0.16em] text-foreground/80"
                          }
                        >
                          <Icon
                            className="size-4 shrink-0"
                            aria-hidden="true"
                          />
                          <span>{contact.label}</span>
                        </div>
                        <a
                          href={contact.href}
                          target={external ? "_blank" : undefined}
                          rel={external ? "noreferrer" : undefined}
                          className={
                            isWarning
                              ? "inline-flex min-w-0 items-center gap-2 text-sm leading-7 break-all text-[#d9d1ad]/90 underline decoration-[#d9d1ad]/40 underline-offset-4 transition hover:text-white"
                              : "inline-flex min-w-0 items-center gap-2 text-sm leading-7 break-all text-foreground/76 underline decoration-foreground/25 underline-offset-4 transition hover:text-destructive"
                          }
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
