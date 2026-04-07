import { cn } from "@/lib/utils"

type SkeletonProps = {
  className?: string
}

function Skeleton({ className }: SkeletonProps) {
  return <div className={cn("animate-pulse rounded-md bg-muted/70", className)} aria-hidden="true" />
}

export { Skeleton }
