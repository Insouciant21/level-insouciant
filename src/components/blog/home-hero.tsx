type HomeHeroProps = {
  title: string
}

function HomeHero({ title }: HomeHeroProps) {
  return (
    <section className="max-w-4xl min-w-0 space-y-5">
      <p className="text-[0.72rem] font-semibold tracking-[0.3em] text-muted-foreground uppercase">
        Facility Hub // Entry Node
      </p>

      <h1 className="max-w-4xl text-4xl leading-[0.98] font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
        {title}
      </h1>
    </section>
  )
}

export { HomeHero }
