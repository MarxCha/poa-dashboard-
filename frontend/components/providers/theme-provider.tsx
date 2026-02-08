'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { themes, Theme, getThemeById } from '@/lib/themes'

interface ThemeContextValue {
  theme: Theme
  setTheme: (id: string) => void
  themes: Theme[]
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: themes[0],
  setTheme: () => {},
  themes,
})

export function useTheme() {
  return useContext(ThemeContext)
}

function applyTheme(theme: Theme) {
  const root = document.documentElement
  Object.entries(theme.colors).forEach(([key, value]) => {
    // Convert camelCase to kebab-case: accent400 -> accent-400
    const cssVar = `--${key.replace(/(\d+)/, '-$1')}`
    root.style.setProperty(cssVar, value)
  })
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(themes[0])

  useEffect(() => {
    const saved = localStorage.getItem('poa-theme')
    if (saved) {
      const t = getThemeById(saved)
      setThemeState(t)
      applyTheme(t)
    } else {
      applyTheme(themes[0])
    }
  }, [])

  const setTheme = useCallback((id: string) => {
    const t = getThemeById(id)
    setThemeState(t)
    applyTheme(t)
    localStorage.setItem('poa-theme', id)
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  )
}
