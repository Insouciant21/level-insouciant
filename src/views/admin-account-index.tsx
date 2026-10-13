import { AdminAccountView } from "@/components/account/account-view"
import { getAccountNotice } from "@/lib/account-page"

import type { load } from "@/server/pages/admin-account-index"
import { IslandProvider } from "@/components/providers/island-provider"
function View({ profile, comments, params }: Awaited<ReturnType<typeof load>>) {
  return (
    <AdminAccountView
      profile={profile}
      comments={comments}
      notice={getAccountNotice(params)}
    />
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
