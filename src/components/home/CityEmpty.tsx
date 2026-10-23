import { useCity } from '../../context/CityContext'
import { findCity } from '../../lib/cities'

/** Aviso cuando una localidad todavía no tiene negocios cargados. */
export function CityEmpty() {
  const { cityCode } = useCity()
  return (
    <div className="rounded-3xl border border-dashed border-border bg-surface/60 px-6 py-10 text-center">
      <span className="text-5xl">🏪</span>
      <h3 className="text-lg font-bold text-text-primary mt-3">Aún no hay negocios en {findCity(cityCode)?.name}</h3>
      <p className="text-sm text-text-secondary mt-1.5">Cambia de localidad arriba para ver los negocios disponibles.</p>
    </div>
  )
}
