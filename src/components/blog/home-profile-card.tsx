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

function HomeProfileCard({
  title,
  summary,
  status,
  location,
  focuses,
  email,
}: HomeProfileCardProps) {
  return (
    <section className="surface-panel px-6 py-6">
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Profile</p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight">{title}</h2>
          </div>
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            {status}
          </span>
        </div>

        <p className="text-sm leading-7 text-muted-foreground">{summary}</p>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="size-4" />
          <span>{location}</span>
        </div>

        <ul className="grid gap-3 text-sm leading-7 text-muted-foreground">
          {focuses.map((focus) => (
            <li key={focus} className="rounded-2xl bg-muted/35 px-4 py-3">
              {focus}
            </li>
          ))}
        </ul>

        <Link
          href={`mailto:${email}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-foreground transition hover:text-primary"
        >
          {email}
          <ArrowUpRight className="size-4" />
        </Link>
      </div>
    </section>
  )
}

export { HomeProfileCard }
