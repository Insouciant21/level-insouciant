type AdminStatCardProps = {
  label: string
  value: string
  hint?: string
}

function AdminStatCard({ label, value, hint }: AdminStatCardProps) {
  return (
    <article className="surface-panel px-5 py-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight">{value}</p>
      {hint ? <p className="mt-2 text-sm text-muted-foreground">{hint}</p> : null}
    </article>
  )
}

export { AdminStatCard }
