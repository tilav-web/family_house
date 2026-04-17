import { Sun, Moon } from 'lucide-react'

type ClientThemeMode = 'gold' | 'midnight'

interface PaletteToggleProps {
  palette: ClientThemeMode
  onToggle: () => void
  className?: string
  white?: boolean
}

export function PaletteToggle({ palette, onToggle, className = '', white }: PaletteToggleProps) {
  const isDark = palette === 'midnight'

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={isDark ? 'Kunduzgi rejim' : 'Tungi rejim'}
      className={`relative flex h-9 w-9 items-center justify-center rounded-lg border transition-all hover:scale-110 active:scale-95 ${
        white
          ? 'border-white/20 bg-white/10 text-white hover:bg-white/20'
          : 'border-[var(--client-line)] bg-background/80 text-foreground hover:border-primary hover:text-primary'
      } backdrop-blur-md ${className}`}
    >
      <Sun
        className={`absolute h-4 w-4 transition-all duration-500 ${
          isDark ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'
        }`}
      />
      <Moon
        className={`absolute h-4 w-4 transition-all duration-500 ${
          isDark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'
        }`}
      />
    </button>
  )
}

export type { ClientThemeMode }
