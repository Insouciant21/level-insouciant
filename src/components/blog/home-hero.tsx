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

const heroStatCardClass = "site-metric-card px-5 py-5"

function HomeHero({
  eyebrow,
  title,
  primaryAction,
  secondaryAction,
  stats,
}: HomeHeroProps) {
  return (
    <section className="grid gap-6">
      <div className="site-section-header items-start">
        <div className="max-w-4xl min-w-0 space-y-5">
          <p className="inline-flex items-center gap-2 text-[0.72rem] font-semibold tracking-[0.3em] text-muted-foreground uppercase">
            <Sparkles className="size-3.5 text-primary" />
            {eyebrow}
          </p>

          <div className="space-y-4">
            <h1 className="max-w-4xl text-4xl leading-[0.98] font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
              {title}
            </h1>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              asChild
              size="lg"
              className="home-hero-primary-action px-5"
            >
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
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className={heroStatCardClass}>
            <p className="text-[0.68rem] tracking-[0.24em] text-muted-foreground uppercase">
              {stat.label}
            </p>
            <p className="mt-3 text-3xl font-semibold tracking-tight">
              {stat.value}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}

export { HomeHero }
