import type { ReactNode } from "react"
import { LocationContext } from "@/lib/navigation"
import { QueryProvider } from "./query-provider"
import { MessageProvider } from "@/components/ui/message-provider"
export function IslandProvider({
  children,
  location = "/",
}: {
  children: ReactNode
  location?: string
}) {
  return (
    <LocationContext.Provider value={location}>
      <QueryProvider>
        <MessageProvider>{children}</MessageProvider>
      </QueryProvider>
    </LocationContext.Provider>
  )
}
