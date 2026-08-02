import { Card } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"

type AdminStatCardProps = {
  label: string
  value: string
  hint?: string
  icon?: LucideIcon
}

function AdminStatCard({ label, value, hint, icon: Icon }: AdminStatCardProps) {
  return (
    <Card className="admin-surface px-5 py-5 text-[#edf3e9]">
      <div className="flex items-center justify-between gap-3">
        <p className="admin-kicker">{label}</p>
        {Icon ? (
          <span className="flex size-8 items-center justify-center rounded-md border border-[#b8d77c]/25 bg-[#b8d77c]/8 text-[#b8d77c]">
            <Icon className="size-4" aria-hidden="true" />
          </span>
        ) : null}
      </div>
      <p className="mt-4 text-3xl font-semibold tracking-tight text-[#edf3e9]">
        {value}
      </p>
      {hint ? (
        <p className="mt-2 text-xs leading-5 text-[#748073]">{hint}</p>
      ) : null}
    </Card>
  )
}

export { AdminStatCard }
