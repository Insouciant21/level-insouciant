import { Card } from "@/components/ui/card"

type AdminStatCardProps = {
  label: string
  value: string
  hint?: string
}

function AdminStatCard({ label, value, hint }: AdminStatCardProps) {
  return (
    <Card className="admin-surface rounded-none px-5 py-5 text-[#e0e0e0]">
      <p className="admin-kicker">{label}</p>
      <p className="mt-4 text-3xl font-semibold tracking-tight text-[#e0e0e0]">
        {value}
      </p>
      {hint ? <p className="admin-copy mt-3">{hint}</p> : null}
    </Card>
  )
}

export { AdminStatCard }
