import type { ComponentProps } from "react"
import { AdminShell } from "@/components/admin/admin-shell"
import AdminPageTransition from "@/components/admin/admin-page-transition"
import { LocationContext } from "@/lib/navigation"
export default function AdminLayout({
  location,
  ...props
}: ComponentProps<typeof AdminShell> & { location: string }) {
  return (
    <LocationContext.Provider value={location}>
      <AdminShell {...props}>
        <AdminPageTransition>{props.children}</AdminPageTransition>
      </AdminShell>
    </LocationContext.Provider>
  )
}
