import Link from "next/link"
import { ArrowUpRight, MapPin } from "lucide-react"

type HomeProfileCardProps = {
  title: string
  summary: string
  status: string
  location: string
  focuses: readonly string[]
  email: string
}

const profilePanelClass = "public-summary-panel px-6 py-6 sm:px-7"
const profileStatusClass =
  "site-status-pill border-[#73766f]/48 bg-[#d9d1ad]/48 text-foreground shadow-[inset_0_1px_0_rgba(255,252,225,0.18)]"
const profileFocusClass =
  "public-summary-card-muted px-4 py-3 transition duration-700 hover:border-foreground/20 hover:bg-[#d9d1ad]/46"

function HomeProfileCard({
  title,
  summary,
  status,
  location,
  focuses,
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
          <span className={profileStatusClass}>{status}</span>
        </header>

        <p className="text-sm leading-7 text-muted-foreground">{summary}</p>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="size-4" />
          <span>{location}</span>
        </div>

        <ul className="grid gap-3 text-sm leading-7 text-muted-foreground">
          {focuses.map((focus) => (
            <li key={focus} className={profileFocusClass}>
              {focus}
            </li>
          ))}
        </ul>

        <Link
          href={`mailto:${email}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-foreground transition hover:text-destructive"
        >
          {email}
          <ArrowUpRight className="size-4" />
        </Link>
      </div>
    </section>
  )
}

export { HomeProfileCard }
