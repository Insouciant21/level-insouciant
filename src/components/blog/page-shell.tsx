import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

type PageShellProps = {
  children: ReactNode
  className?: string
}

function PageShell({ children, className }: PageShellProps) {
  return (
    <main
      className={cn(
        "relative z-10 mx-auto flex w-full max-w-[88rem] flex-1 flex-col gap-12 px-5 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12",
        className
      )}
    >
      {children}
    </main>
  )
}

export { PageShell }
