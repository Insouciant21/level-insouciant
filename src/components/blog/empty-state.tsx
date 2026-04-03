type EmptyStateProps = {
  title: string
  description: string
}

function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <section className="surface-panel border-dashed px-6 py-10 text-center">
      <div className="mx-auto max-w-lg space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        <p className="text-sm leading-7 text-muted-foreground">{description}</p>
      </div>
    </section>
  )
}

export { EmptyState }
