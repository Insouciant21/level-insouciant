"use client"

import { Check, ChevronDown } from "lucide-react"

import {
  Select,
  SelectContent,
  SelectIcon,
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  SelectTrigger,
  SelectValue,
  SelectViewport,
} from "@/components/ui/select"
import type { ContactKindOption } from "@/lib/contact-kinds"

type AdminSelectProps = {
  id: string
  value: string
  options: readonly ContactKindOption[]
  onValueChange: (value: string) => void
  ariaLabel?: string
}

function AdminSelect({
  id,
  value,
  options,
  onValueChange,
  ariaLabel,
}: AdminSelectProps) {
  const selectedOption = options.find((option) => option.value === value)
  const SelectedIcon = selectedOption?.icon

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger
        id={id}
        aria-label={ariaLabel}
        className="admin-input h-10 w-full gap-2 text-left"
      >
        <SelectValue>
          <span className="flex min-w-0 items-center gap-2">
            {SelectedIcon ? <SelectedIcon className="size-4 shrink-0" aria-hidden="true" /> : null}
            <span className="truncate">{selectedOption?.label ?? value}</span>
          </span>
        </SelectValue>
        <SelectIcon>
          <ChevronDown className="size-4 shrink-0 text-[#9aa79a]" aria-hidden="true" />
        </SelectIcon>
      </SelectTrigger>

      <SelectContent>
        <SelectViewport>
          {options.map((option) => {
            const Icon = option.icon

            return (
              <SelectItem key={option.value} value={option.value}>
                <Icon className="size-4 shrink-0 text-[#9aa79a]" aria-hidden="true" />
                <SelectItemText>{option.label}</SelectItemText>
                <SelectItemIndicator>
                  <Check className="size-4 text-[var(--safety-exit-green-strong)]" aria-hidden="true" />
                </SelectItemIndicator>
              </SelectItem>
            )
          })}
        </SelectViewport>
      </SelectContent>
    </Select>
  )
}

export { AdminSelect }
