type AdminStatCardProps = {
  label: string
  value: string
  hint?: string
}

function AdminStatCard({ label, value, hint }: AdminStatCardProps) {
  return (
    <article className="admin-surface px-5 py-5">
      <p className="admin-kicker">{label}</p>
      <p className="mt-4 text-3xl font-semibold tracking-tight text-[#f1eadb]">{value}</p>
      {hint ? <p className="admin-copy mt-3">{hint}</p> : null}
    </article>
  )
}

export { AdminStatCard }
