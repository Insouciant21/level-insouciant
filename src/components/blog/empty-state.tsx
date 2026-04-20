type EmptyStateProps = {
  title: string
  description: string
}

function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <section className="surface-panel border-dashed px-6 py-12 text-center sm:px-8">
      <div className="mx-auto max-w-2xl space-y-4">
        <p className="utility-kicker">No Public Record Yet</p>
        <h2 className="text-2xl font-semibold tracking-tight text-balance">{title}</h2>
        <p className="text-sm leading-8 text-muted-foreground sm:text-base">{description}</p>
      </div>
    </section>
  )
}

export { EmptyState }
