import { Link } from 'react-router-dom'

/** Aviso de que ya no se toman pedidos por hoy (después de las 9:00 pm). */
export function ClosedTodayBanner() {
  return (
    <div className="mt-4 rounded-3xl border border-amber-200 bg-amber-50 p-4">
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0" aria-hidden="true">🌙</span>
        <div className="min-w-0">
          <p className="text-sm font-bold text-amber-900">Pedidos cerrados por hoy</p>
          <p className="text-[13px] text-amber-800 leading-relaxed mt-0.5">
            Ya terminamos de tomar encargos por hoy. Las mensajerías pendientes se entregarán con
            normalidad. Vuelve mañana a partir de las 9:00 am para hacer tu pedido.
          </p>
          <Link
            to="/pedidos"
            className="inline-flex items-center gap-1 mt-2 text-[13px] font-bold text-amber-900 underline"
          >
            Ver mis pedidos
          </Link>
        </div>
      </div>
    </div>
  )
}
