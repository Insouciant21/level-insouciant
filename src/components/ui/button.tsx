import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center border-[2px] border-transparent bg-clip-padding font-sans text-[0.78rem] font-semibold whitespace-nowrap uppercase tracking-[0.24em] text-foreground transition-all duration-200 outline-none select-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 active:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "border-[#3e9256] bg-primary text-primary-foreground shadow-[inset_0_0_18px_rgba(0,0,0,0.2)] hover:border-[#5eb475] hover:bg-[#368c54]",
        outline:
          "border-[#6f7b83] bg-secondary text-secondary-foreground shadow-[inset_0_0_18px_rgba(0,0,0,0.18)] hover:border-[#87939b] hover:bg-[#717d86]",
        secondary:
          "border-[#d0a54d] bg-accent text-accent-foreground shadow-[inset_0_0_18px_rgba(0,0,0,0.15)] hover:border-[#e1b25a] hover:bg-[#dfaa38]",
        ghost:
          "border-transparent bg-transparent text-muted-foreground shadow-none hover:border-border/80 hover:bg-card/70 hover:text-foreground aria-expanded:bg-card aria-expanded:text-foreground",
        destructive:
          "border-[#9d463a] bg-destructive text-destructive-foreground shadow-[inset_0_0_18px_rgba(0,0,0,0.2)] hover:border-[#b65f52] hover:bg-[#924034] focus-visible:border-destructive/60 focus-visible:ring-destructive/25",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-10 gap-1.5 px-4 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        xs: "h-7 gap-1 px-2.5 text-[0.68rem] has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-9 gap-1 px-3 text-[0.72rem] has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-11 gap-1.5 px-5 text-[0.82rem] has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4",
        icon: "size-10",
        "icon-xs":
          "size-7 [&_svg:not([class*='size-'])]:size-3",
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
