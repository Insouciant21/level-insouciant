type PageIntroProps = {
  eyebrow?: string
  title: string
  description: string
}

function PageIntro({ eyebrow, title, description }: PageIntroProps) {
  return (
    <section className="site-section-header max-w-5xl items-start">
      <div className="space-y-3">
        {eyebrow ? <p className="utility-kicker">{eyebrow}</p> : null}
        <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl md:text-5xl">
          {title}
        </h1>
        <p className="max-w-3xl text-base leading-7 text-muted-foreground md:text-lg">
          {description}
        </p>
      </div>
    </section>
  )
}

export { PageIntro }
