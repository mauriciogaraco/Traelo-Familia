import { useEffect, useRef, useState } from 'react'

interface Slot {
  value: string
  label: string
}

const ITEM_H = 44

/**
 * Selector de hora estilo "rueda" del teléfono: scroll vertical con snap, el
 * valor centrado es el seleccionado. Solo recibe franjas válidas (futuras), así
 * que las horas pasadas quedan bloqueadas por construcción.
 */
export function TimeWheel({
  slots,
  value,
  onChange,
}: {
  slots: Slot[]
  value: string
  onChange: (value: string) => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const settle = useRef<number | undefined>(undefined)
  const initial = Math.max(0, slots.findIndex((s) => s.value === value))
  const [activeIdx, setActiveIdx] = useState(initial)

  // Posiciona el scroll en el valor seleccionado (al montar o si cambia desde fuera).
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const idx = slots.findIndex((s) => s.value === value)
    if (idx >= 0) {
      el.scrollTop = idx * ITEM_H
      setActiveIdx(idx)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, slots.length])

  function handleScroll() {
    const el = ref.current
    if (!el) return
    const idx = Math.min(slots.length - 1, Math.max(0, Math.round(el.scrollTop / ITEM_H)))
    setActiveIdx(idx)
    window.clearTimeout(settle.current)
    settle.current = window.setTimeout(() => {
      if (slots[idx]) onChange(slots[idx].value)
    }, 110)
  }

  return (
    <div className="relative h-[132px] select-none bg-surface">
      {/* banda central de selección */}
      <div className="pointer-events-none absolute inset-x-2 top-1/2 -translate-y-1/2 h-11 rounded-xl border-y-2 border-primary/30 bg-primary/5" />
      {/* difuminados arriba/abajo */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-11 z-10 bg-gradient-to-b from-surface to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-11 z-10 bg-gradient-to-t from-surface to-transparent" />

      <div
        ref={ref}
        onScroll={handleScroll}
        className="h-full overflow-y-auto snap-y snap-mandatory scrollbar-none"
      >
        <div style={{ height: ITEM_H }} />
        {slots.map((s, i) => (
          <button
            type="button"
            key={s.value}
            onClick={() => ref.current?.scrollTo({ top: i * ITEM_H, behavior: 'smooth' })}
            className={`block w-full snap-center transition-all duration-150 ${
              i === activeIdx
                ? 'text-primary text-lg font-extrabold'
                : Math.abs(i - activeIdx) === 1
                  ? 'text-text-secondary text-base font-semibold'
                  : 'text-text-secondary/50 text-sm font-medium'
            }`}
            style={{ height: ITEM_H, lineHeight: `${ITEM_H}px` }}
          >
            {s.label}
          </button>
        ))}
        <div style={{ height: ITEM_H }} />
      </div>
    </div>
  )
}
