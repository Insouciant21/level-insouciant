"use client"

import * as React from "react"
import { MoonStar, SunMedium } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = mounted && resolvedTheme === "dark"
  const label = isDark ? "切换到浅色模式" : "切换到暗黑模式"

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      aria-label={label}
      className="gap-2 rounded-full border-border/70 bg-background/70 px-3 backdrop-blur-sm"
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? <SunMedium className="size-4" /> : <MoonStar className="size-4" />}
      <span className="hidden sm:inline">{isDark ? "浅色" : "暗黑"}</span>
    </Button>
  )
}

export { ThemeToggle }
