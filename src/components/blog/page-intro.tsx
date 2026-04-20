type PageIntroProps = {
  eyebrow?: string
  title: string
  description: string
}

function PageIntro({ eyebrow, title, description }: PageIntroProps) {
  return (
    <section className="max-w-5xl border-l-[3px] border-foreground/18 pl-5">
      {eyebrow ? <p className="utility-kicker">{eyebrow}</p> : null}
      <div className="mt-4 space-y-4">
        <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl md:text-6xl">
          {title}
        </h1>
        <p className="max-w-3xl text-base leading-8 text-muted-foreground md:text-lg">
          {description}
        </p>
        <div className="h-px w-full max-w-3xl bg-foreground/18" />
      </div>
    </section>
  )
}

export { PageIntro }
