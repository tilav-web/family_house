type ClientThemeMode = 'gold' | 'midnight'

interface PaletteToggleProps {
  palette: ClientThemeMode
  onToggle: () => void
}

const paletteMeta: Record<ClientThemeMode, { label: string; swatches: string[] }> = {
  gold: {
    label: "Oltin / Kulrang",
    swatches: ['#f7c415', '#d8b008', '#eceaea', '#b6b3b3'],
  },
  midnight: {
    label: "Tungi / Ko'k",
    swatches: ['#050505', '#0a0a55', '#1810ad', '#2618ff'],
  },
}

export function PaletteToggle({ palette, onToggle }: PaletteToggleProps) {
  const currentPalette = paletteMeta[palette]

  return (
    <button
      type="button"
      onClick={onToggle}
      className="fixed bottom-5 right-5 z-[70] flex items-center gap-3 rounded-lg border border-[var(--client-line)] bg-[var(--client-panel-strong)] px-4 py-3 text-left text-foreground shadow-[0_24px_60px_var(--client-shadow)] backdrop-blur-md transition-transform hover:-translate-y-0.5"
      aria-label={`Rang palitrasi: ${currentPalette.label}`}
    >
      <div className="flex items-center gap-1">
        {currentPalette.swatches.map((color) => (
          <span
            key={color}
            className="h-4 w-4 rounded-full border border-black/10"
            style={{ backgroundColor: color }}
          />
        ))}
      </div>

      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Palitra
        </p>
        <p className="truncate text-sm font-semibold">{currentPalette.label}</p>
      </div>
    </button>
  )
}

export type { ClientThemeMode }
