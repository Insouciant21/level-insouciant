import Link from "next/link"
import { ArrowRight, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"

type HeroStat = {
  label: string
  value: string
}

type HomeHeroProps = {
  eyebrow: string
  title: string
  description: string
  note: string
  primaryAction: {
    href: string
    label: string
  }
  secondaryAction: {
    href: string
    label: string
  }
  stats: HeroStat[]
}

const heroPanelClass =
  "public-summary-panel"
const heroStatCardClass =
  "public-summary-card px-5 py-5"

function HomeHero({
  eyebrow,
  title,
  description,
  note,
  primaryAction,
  secondaryAction,
  stats,
}: HomeHeroProps) {
  return (
    <section className="overflow-hidden px-1">
      <div className="grid min-h-[24rem] gap-10">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.12fr)_minmax(300px,0.88fr)] lg:items-start">
          <div className="space-y-6">
            <p className="inline-flex items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              <Sparkles className="size-3.5 text-primary" />
              {eyebrow}
            </p>

            <div className="max-w-4xl space-y-5">
              <h1 className="max-w-5xl text-5xl font-semibold leading-[0.95] tracking-tight text-balance sm:text-6xl lg:text-7xl">
                {title}
              </h1>
              <p className="max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
                {description}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="px-5">
                <Link href={primaryAction.href}>
                  {primaryAction.label}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="px-5">
                <Link href={secondaryAction.href}>{secondaryAction.label}</Link>
              </Button>
            </div>
          </div>

          <aside className="flex lg:justify-end">
            <div className={`${heroPanelClass} w-full max-w-md px-5 py-5`}>
              <p className="utility-kicker">Entry Note</p>
              <p className="mt-4 text-sm leading-8 text-muted-foreground">{note}</p>
            </div>
          </aside>
        </div>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(340px,0.8fr)] xl:items-end">
          <div className="grid gap-4 sm:grid-cols-3">
            {stats.map((stat) => (
              <div key={stat.label} className={heroStatCardClass}>
                <p className="text-[0.68rem] uppercase tracking-[0.24em] text-muted-foreground">
                  {stat.label}
                </p>
                <p className="mt-4 text-3xl font-semibold tracking-tight">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export { HomeHero }
