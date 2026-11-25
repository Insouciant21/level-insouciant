type HomeHeroProps = {
  title: string
}

function HomeHero({ title }: HomeHeroProps) {
  return (
    <section className="relative min-w-0 border-b border-border/75 pb-6 sm:pb-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-mono text-[0.72rem] font-medium tracking-[0.28em] text-muted-foreground uppercase">
          Facility Hub // Entry Node
        </p>
        <span className="font-mono text-[0.66rem] tracking-[0.2em] text-muted-foreground/85 uppercase">
          SECTOR 00 · ARCHIVE ACCESS
        </span>
      </div>

      <h1 className="mt-4 max-w-4xl text-4xl leading-[1.08] font-semibold tracking-tight text-balance sm:text-5xl lg:text-[3.75rem]">
        {title}
      </h1>
    </section>
  )
}

export { HomeHero }
