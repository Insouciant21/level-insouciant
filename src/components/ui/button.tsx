import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-md border border-transparent bg-clip-padding font-sans text-sm font-semibold tracking-[0.06em] whitespace-nowrap text-foreground transition-all duration-200 outline-none select-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 active:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "border-primary/65 bg-primary text-primary-foreground shadow-[inset_0_1px_0_rgba(255,252,225,0.18),0_16px_28px_-22px_rgba(0,0,0,0.28)] hover:border-primary/80 hover:bg-primary/85",
        outline:
          "border-[#73766f]/55 bg-[#d9d1ad]/52 text-foreground shadow-[inset_0_1px_0_rgba(255,252,225,0.22),0_14px_26px_-24px_rgba(0,0,0,0.32)] hover:border-foreground/22 hover:bg-[#c6bd99]/62",
        secondary:
          "border-accent/60 bg-accent text-accent-foreground shadow-[inset_0_1px_0_rgba(255,252,225,0.18),0_16px_28px_-22px_rgba(0,0,0,0.24)] hover:border-accent/75 hover:bg-accent/88",
        ghost:
          "border-transparent bg-transparent text-muted-foreground shadow-none hover:border-[#73766f]/45 hover:bg-[#d9d1ad]/36 hover:text-foreground aria-expanded:border-[#73766f]/45 aria-expanded:bg-[#d9d1ad]/42 aria-expanded:text-foreground",
        destructive:
          "border-destructive/70 bg-destructive text-destructive-foreground shadow-[inset_0_1px_0_rgba(255,252,225,0.12),0_16px_28px_-22px_rgba(0,0,0,0.28)] hover:border-destructive/85 hover:bg-destructive/88 focus-visible:border-destructive/60 focus-visible:ring-destructive/25",
        link: "text-[#8a4f34] underline-offset-4 hover:text-[#6f3f28] hover:underline",
      },
      size: {
        default:
          "h-10 gap-1.5 px-4 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        xs: "h-7 gap-1 px-2.5 text-[0.68rem] has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-9 gap-1 px-3 text-[0.72rem] has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-11 gap-1.5 px-5 text-[0.82rem] has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4",
        icon: "size-10",
        "icon-xs": "size-7 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-9",
        "icon-lg": "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
