export interface ChipItem {
  key: string
  label: string
  selected: boolean
}

/** Fila de chips con scroll horizontal (orden, filtros, categorías). */
export function ChipRow({ label, items, onPress }: { label: string; items: ChipItem[]; onPress: (key: string) => void }) {
  return (
    <div role="group" aria-label={label} className="flex gap-2 overflow-x-auto scrollbar-none -mx-4 px-4 pb-1">
      {items.map((item) => (
        <button
          key={item.key}
          onClick={() => onPress(item.key)}
          aria-pressed={item.selected}
          className={`flex-shrink-0 h-9 px-3.5 rounded-full text-[13px] font-bold border transition-colors ${
            item.selected ? 'bg-primary text-white border-primary shadow-btn-primary' : 'bg-surface text-text-secondary border-border hover:border-primary/40'
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}

export function SegmentedTabs<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: T
  onChange: (key: T) => void
  options: { key: T; label: string; count?: number }[]
}) {
  return (
    <div role="tablist" aria-label={label} className="flex p-1 rounded-2xl bg-stone-100 border border-border/60">
      {options.map((opt) => {
        const active = opt.key === value
        return (
          <button
            key={opt.key}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.key)}
            className={`flex-1 h-10 rounded-xl text-sm font-bold transition-all ${active ? 'bg-surface text-primary shadow-soft' : 'text-text-secondary'}`}
          >
            {opt.label}
            {opt.count !== undefined && <span className="ml-1.5 text-[11px] font-semibold opacity-70">{opt.count}</span>}
          </button>
        )
      })}
    </div>
  )
}
