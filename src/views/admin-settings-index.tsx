import { SiteSettingsForm } from "@/components/admin/site-settings-form"

import type { load } from "@/server/pages/admin-settings-index"
import { IslandProvider } from "@/components/providers/island-provider"
function View({ siteConfig }: Awaited<ReturnType<typeof load>>) {
  return (
    <div className="grid gap-6">
      <header className="admin-surface p-4 sm:p-6 lg:p-7">
        <p className="admin-kicker-accent">Site Settings</p>
        <h1 className="admin-title mt-2">站点设置</h1>
      </header>
      <SiteSettingsForm siteConfig={siteConfig} />
    </div>
  )
}
export default function Page(
  props: Awaited<ReturnType<typeof load>> & { location: string }
) {
  return (
    <IslandProvider location={props.location}>
      <View {...props} />
    </IslandProvider>
  )
}
