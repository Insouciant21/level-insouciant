type PageIntroProps = {
  eyebrow?: string
  title: string
  description: string
}

function PageIntro({ eyebrow, title, description }: PageIntroProps) {
  return (
    <section className="space-y-4 border-b border-border/60 pb-10">
      {eyebrow ? (
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          {eyebrow}
        </p>
      ) : null}
      <div className="max-w-3xl space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl md:text-5xl">
          {title}
        </h1>
        <p className="text-base leading-7 text-muted-foreground md:text-lg">{description}</p>
      </div>
    </section>
  )
}

export { PageIntro }
