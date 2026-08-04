import { cn } from "@/lib/utils"

type SkeletonTone = "neutral" | "soft" | "accent" | "inverse"

type SkeletonProps = {
  className?: string
  tone?: SkeletonTone
}

const skeletonToneClasses = {
  neutral: "bg-black/9 border-black/8",
  soft: "bg-black/5 border-black/6",
  accent: "bg-primary/20 border-primary/30",
  inverse: "bg-white/10 border-white/10",
} as const

function Skeleton({ className, tone = "neutral" }: SkeletonProps) {
  return (
    <div
      className={cn(
        "level-insouciant-skeleton animate-pulse border shadow-[inset_0_1px_0_rgba(255,255,255,0.42)]",
        skeletonToneClasses[tone],
        className
      )}
      aria-hidden="true"
      data-skeleton-tone={tone}
    />
  )
}

export { Skeleton }
