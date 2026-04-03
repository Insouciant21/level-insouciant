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
    <section className="surface-panel surface-grid overflow-hidden px-6 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(300px,0.8fr)] lg:items-end">
        <div className="space-y-6">
          <div className="space-y-4">
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
              <Sparkles className="size-3.5 text-primary" />
              {eyebrow}
            </p>
            <div className="max-w-3xl space-y-4">
              <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
                {title}
              </h1>
              <p className="max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
                {description}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg" className="rounded-full px-5">
              <Link href={primaryAction.href}>
                {primaryAction.label}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="rounded-full border-border/70 bg-background/55 px-5"
            >
              <Link href={secondaryAction.href}>{secondaryAction.label}</Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-[1.75rem] border border-border/70 bg-background/70 px-5 py-5 backdrop-blur-sm"
              >
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                  {stat.label}
                </p>
                <p className="mt-3 text-3xl font-semibold tracking-tight">{stat.value}</p>
              </div>
            ))}
          </div>
          <div className="rounded-[1.75rem] border border-border/70 bg-primary/8 px-5 py-5">
            <p className="text-sm leading-7 text-muted-foreground">{note}</p>
          </div>
        </div>
      </div>
    </section>
  )
}

export { HomeHero }
