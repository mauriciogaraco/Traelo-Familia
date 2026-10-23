import { useState } from 'react'
import { useCity } from '../../context/CityContext'
import { findCity } from '../../lib/cities'
import { CitySheet } from './CitySheet'

/**
 * Selector de localidad del header. En la primera visita abre la hoja obligatoria
 * ("¿Dónde vive tu familia?"); después se cambia desde aquí.
 */
export function CityPill() {
  const { cityCode, needsChoice, setCity } = useCity()
  const [open, setOpen] = useState(false)
  const city = findCity(cityCode)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 max-w-[190px] pl-2.5 pr-2 py-1.5 rounded-full bg-surface/80 backdrop-blur border border-border hover:border-primary/40 transition-colors"
        aria-label={`Localidad: ${city?.name}. Cambiar`}
      >
        <span aria-hidden="true">📍</span>
        <span className="flex flex-col items-start min-w-0 leading-tight">
          <span className="text-[10px] font-semibold text-text-secondary -mb-0.5">Negocios de</span>
          <span className="text-xs font-bold text-text-primary truncate max-w-[120px]">{city?.short}</span>
        </span>
        <svg className="text-text-secondary flex-shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
        </svg>
      </button>
      <CitySheet
        open={open || needsChoice}
        current={cityCode}
        required={needsChoice}
        onSelect={(code) => {
          setCity(code)
          setOpen(false)
        }}
        onClose={() => setOpen(false)}
      />
    </>
  )
}
