'use client'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

import { Switch } from '@/components/ui/switch'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  
  return (
    <div className="flex items-center gap-1 border p-1 rounded-lg">
      <Sun className="h-[1rem] w-[1rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-100" />
      <Switch 
        checked={theme==="dark"?true:false}
        onCheckedChange={()=> setTheme(theme === "light" ? "dark" : "light")}
      />
      <Moon className="h-[1rem] w-[1rem] rotate-90 scale-100 transition-all dark:rotate-0 dark:scale-100" />
    </div>
  )
}
