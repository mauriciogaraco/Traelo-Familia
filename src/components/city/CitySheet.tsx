import { useEffect } from 'react'
import { CITIES, type CityCode } from '../../lib/cities'

interface CitySheetProps {
  open: boolean
  current: CityCode
  /** Primera visita: no se puede cerrar sin elegir. */
  required?: boolean
  onSelect: (code: CityCode) => void
  onClose: () => void
}

/** Hoja para elegir de qué localidad se ve el catálogo (Güira de Melena o San Antonio de los Baños). */
export function CitySheet({ open, current, required = false, onSelect, onClose }: CitySheetProps) {
  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center">
      <button
        aria-label="Cerrar"
        onClick={required ? undefined : onClose}
        className="absolute inset-0 bg-black/45 animate-fade-in"
        tabIndex={required ? -1 : 0}
      />
      <div role="dialog" aria-modal="true" aria-label="Elegir localidad" className="relative w-full max-w-[440px] bg-surface rounded-t-4xl shadow-2xl animate-slide-up px-5 pt-4 pb-7">
        <div className="w-10 h-1.5 bg-border rounded-full mx-auto mb-4" />
        <h2 className="text-lg font-extrabold text-text-primary">
          {required ? '¿Dónde vive tu familia?' : 'Cambiar localidad'}
        </h2>
        <p className="text-sm text-text-secondary mt-1">
          Te mostramos los negocios de esa localidad. Puedes cambiarla cuando quieras.
        </p>
        <div className="mt-4 space-y-2.5">
          {CITIES.map((city) => {
            const active = city.code === current && !required
            return (
              <button
                key={city.code}
                onClick={() => onSelect(city.code)}
                className={`w-full flex items-center gap-3 rounded-2xl border px-4 py-3.5 text-left transition-all active:scale-[0.99] ${
                  active ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'border-border bg-background hover:border-primary/40'
                }`}
              >
                <span className="text-2xl" aria-hidden="true">📍</span>
                <span className="flex-1 font-bold text-text-primary">{city.name}</span>
                {active && <span className="text-primary text-xs font-bold">Actual</span>}
              </button>
            )
          })}
        </div>
        {!required && (
          <button onClick={onClose} className="mt-4 w-full h-11 rounded-2xl text-sm font-bold text-text-secondary hover:bg-black/5">
            Cancelar
          </button>
        )}
      </div>
    </div>
  )
}
