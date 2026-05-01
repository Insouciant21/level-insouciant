import { cn } from "@/lib/utils"

type SkeletonProps = {
  className?: string
}

function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "insous-skeleton animate-pulse border border-black/8 bg-black/9 shadow-[inset_0_1px_0_rgba(255,255,255,0.42)]",
        className
      )}
      aria-hidden="true"
    />
  )
}

export { Skeleton }
