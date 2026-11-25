import Link from "@/lib/navigation"
import { ArrowUpRight, MapPin } from "lucide-react"

type HomeProfileCardProps = {
  title: string
  summary: string
  status: string
  location: string
  quotes: readonly string[]
  email: string
}

const profilePanelClass = "public-summary-panel px-6 py-6 sm:px-7"
const profileStatusClass =
  "site-status-pill border-[#73766f]/48 bg-[#d9d1ad]/58 text-foreground shadow-[inset_0_1px_0_rgba(255,252,225,0.18)]"
const profileFocusClass =
  "public-summary-card-muted border-l-2 border-l-primary/70 px-4 py-3 transition duration-200 hover:border-foreground/25 hover:bg-[#d9d1ad]/50"

function HomeProfileCard({
  title,
  summary,
  status,
  location,
  quotes,
  email,
}: HomeProfileCardProps) {
  return (
    <section className={profilePanelClass}>
      <div className="space-y-5">
        <header className="site-section-header">
          <div>
            <p className="utility-kicker">Custodian Note</p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">
              {title}
            </h2>
          </div>
          <span className={profileStatusClass}>
            <span className="size-1.5 bg-primary" aria-hidden="true" />
            {status}
          </span>
        </header>

        <p className="text-sm leading-7 text-foreground/82">{summary}</p>

        <div className="flex items-center gap-2 font-mono text-xs tracking-[0.1em] text-muted-foreground uppercase">
          <MapPin className="size-3.5 text-primary" aria-hidden="true" />
          <span>Sector Location // {location}</span>
        </div>

        <ul className="grid gap-2.5 text-sm leading-7 text-muted-foreground">
          {quotes.map((quote) => (
            <li key={quote} className={`${profileFocusClass} break-words`}>
              <blockquote>{quote}</blockquote>
            </li>
          ))}
        </ul>

        <div className="border-t border-border/60 pt-4">
          <Link
            href={`mailto:${email}`}
            className="inline-flex items-center gap-2 font-mono text-xs font-medium tracking-[0.08em] text-foreground transition hover:text-destructive"
          >
            <span className="text-muted-foreground uppercase">
              Transmission //
            </span>
            <span>{email}</span>
            <ArrowUpRight className="size-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  )
}

export { HomeProfileCard }
