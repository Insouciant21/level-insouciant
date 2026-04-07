import { redirect } from "next/navigation"

import { getCurrentUser } from "@/lib/auth"

export default async function AdminEntryPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login?next=/account")
  }

  if (user.role === "ADMIN") {
    redirect("/admin/dashboard")
  }

  redirect("/account")
}
