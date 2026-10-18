import { Sparkles } from "lucide-react"

type HeroStat = {
  label: string
  value: string
}

type HomeHeroProps = {
  eyebrow: string
  title: string
  stats: HeroStat[]
}

const heroStatCardClass = "site-metric-card px-5 py-5"

function HomeHero({ eyebrow, title, stats }: HomeHeroProps) {
  return (
    <section className="grid gap-6">
      <div className="max-w-4xl min-w-0 space-y-5">
        <p className="inline-flex items-center gap-2 text-[0.72rem] font-semibold tracking-[0.3em] text-muted-foreground uppercase">
          <Sparkles className="size-3.5 text-primary" />
          {eyebrow}
        </p>

        <h1 className="max-w-4xl text-4xl leading-[0.98] font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
          {title}
        </h1>
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
