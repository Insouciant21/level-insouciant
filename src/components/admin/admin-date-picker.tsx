"use client"

import { useMemo, useState } from "react"
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react"

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

type AdminDatePickerProps = {
  id: string
  name: string
  value: string
  onChange: (value: string) => void
  required?: boolean
}

const weekdayLabels = ["一", "二", "三", "四", "五", "六", "日"]

function parseDateValue(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)

  if (!match) {
    return null
  }

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(year, month - 1, day)

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null
  }

  return date
}

function formatDateValue(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function formatDateLabel(date: Date) {
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
}

function getCalendarCells(month: Date) {
  const year = month.getFullYear()
  const monthIndex = month.getMonth()
  const firstDayOffset = (new Date(year, monthIndex, 1).getDay() + 6) % 7
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()

  return Array.from({ length: 42 }, (_, index) => {
    const day = index - firstDayOffset + 1

    return day >= 1 && day <= daysInMonth
      ? new Date(year, monthIndex, day)
      : null
  })
}

function AdminDatePicker({
  id,
  name,
  value,
  onChange,
  required = false,
}: AdminDatePickerProps) {
  const selectedDate = parseDateValue(value)
  const [open, setOpen] = useState(false)
  const [visibleMonth, setVisibleMonth] = useState(() =>
    startOfMonth(selectedDate ?? new Date())
  )

  const calendarCells = useMemo(
    () => getCalendarCells(visibleMonth),
    [visibleMonth]
  )

  function changeMonth(offset: number) {
    setVisibleMonth(
      (current) => new Date(current.getFullYear(), current.getMonth() + offset, 1)
    )
  }

  function selectDate(date: Date) {
    onChange(formatDateValue(date))
    setVisibleMonth(startOfMonth(date))
    setOpen(false)
  }

  return (
    <>
      <input
        id={`${id}-value`}
        type="hidden"
        name={name}
        value={value}
        required={required}
        readOnly
      />

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            id={id}
            type="button"
            aria-haspopup="dialog"
            aria-label="打开日期选择器"
            aria-expanded={open}
            className="admin-input flex h-10 w-full items-center justify-between gap-3 text-left"
          >
            <span className="flex min-w-0 items-center gap-2">
              <CalendarDays className="size-4 shrink-0 text-[#9aa79a]" aria-hidden="true" />
              <span className="truncate">
                {selectedDate ? formatDateLabel(selectedDate) : "选择日期"}
              </span>
            </span>
            <ChevronRight
              className={cn(
                "size-4 shrink-0 text-[#748073] transition-transform",
                open && "rotate-90"
              )}
              aria-hidden="true"
            />
          </button>
        </PopoverTrigger>

        <PopoverContent
          role="dialog"
          aria-label="选择发布日期"
          className="w-[min(20rem,calc(100vw-2rem))] p-4"
        >
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              aria-label="上个月"
              className="flex size-8 items-center justify-center rounded-md text-[#9aa79a] transition-colors hover:bg-[#2c3529] hover:text-[#edf3e9]"
              onClick={() => changeMonth(-1)}
            >
              <ChevronLeft className="size-4" aria-hidden="true" />
            </button>
            <p className="text-sm font-semibold tracking-[0.08em]">
              {visibleMonth.getFullYear()}年{visibleMonth.getMonth() + 1}月
            </p>
            <button
              type="button"
              aria-label="下个月"
              className="flex size-8 items-center justify-center rounded-md text-[#9aa79a] transition-colors hover:bg-[#2c3529] hover:text-[#edf3e9]"
              onClick={() => changeMonth(1)}
            >
              <ChevronRight className="size-4" aria-hidden="true" />
            </button>
          </div>

          <div className="mt-4 grid grid-cols-7 gap-1 text-center text-[0.68rem] font-semibold text-[#748073]">
            {weekdayLabels.map((label) => (
              <span key={label} className="h-7 leading-7" aria-hidden="true">
                {label}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {calendarCells.map((date, index) => {
              const dateValue = date ? formatDateValue(date) : null
              const isSelected = dateValue === value

              return (
                <div
                  key={dateValue ?? `empty-${index}`}
                  data-calendar-cell
                  className="flex h-9 items-center justify-center"
                >
                  {date ? (
                    <button
                      type="button"
                      aria-label={`选择 ${formatDateLabel(date)}`}
                      aria-pressed={isSelected}
                      className={cn(
                        "flex size-8 items-center justify-center rounded-md text-sm text-[#dce6d8] transition-colors hover:bg-[#2c3529] hover:text-[#edf3e9]",
                        isSelected &&
                          "bg-[var(--safety-exit-green)] font-semibold text-[#182015] hover:bg-[var(--safety-exit-green-strong)]"
                      )}
                      onClick={() => selectDate(date)}
                    >
                      {date.getDate()}
                    </button>
                  ) : null}
                </div>
              )
            })}
          </div>
        </PopoverContent>
      </Popover>
    </>
  )
}

export { AdminDatePicker }
