"use client"

import * as React from "react"
import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ThemeToggle() {
  const { theme, setTheme, systemTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // Để tránh hydration mismatch
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="ghost" size="sm">
        <Sun className="h-4 w-4" />
      </Button>
    )
  }

  // Xác định theme hiện tại (bao gồm system)
  const currentTheme = theme === "system" ? systemTheme : theme
  const isLight = currentTheme === "light"
  const isDark = currentTheme === "dark"
  const isSystem = theme === "system"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          {isSystem ? (
            <Monitor className="h-4 w-4" />
          ) : isLight ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={() => setTheme("light")}
          className={theme === "light" ? "bg-sky-100 dark:bg-sky-900" : ""}
        >
          <Sun className="mr-2 h-4 w-4" />
          <span>Sáng</span>
          {theme === "light" && (
            <span className="ml-auto text-sky-600 dark:text-sky-400">✓</span>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("dark")}
          className={theme === "dark" ? "bg-sky-100 dark:bg-sky-900" : ""}
        >
          <Moon className="mr-2 h-4 w-4" />
          <span>Tối</span>
          {theme === "dark" && (
            <span className="ml-auto text-sky-600 dark:text-sky-400">✓</span>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("system")}
          className={theme === "system" ? "bg-sky-100 dark:bg-sky-900" : ""}
        >
          <Monitor className="mr-2 h-4 w-4" />
          <span>Hệ thống</span>
          {theme === "system" && (
            <span className="ml-auto text-sky-600 dark:text-sky-400">✓</span>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
