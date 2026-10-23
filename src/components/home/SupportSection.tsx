import { Link } from 'react-router-dom'
import { useCity } from '../../context/CityContext'
import { supportContactFor } from '../../lib/cities'

/** Tarjeta de ayuda del final del Home: WhatsApp de la localidad activa + enlace a la página de Ayuda. */
export function SupportSection() {
  const { cityCode } = useCity()
  const support = supportContactFor(cityCode)
  return (
    <section className="pb-4">
      <div className="rounded-3xl border border-border bg-surface px-6 py-8 text-center shadow-soft">
        <div className="text-5xl mb-3">💬</div>
        <h3 className="text-lg font-bold text-text-primary">¿Necesitas ayuda?</h3>
        <p className="text-sm text-text-secondary mt-2 max-w-sm mx-auto">
          Si tienes dudas sobre cómo hacer un pedido o necesitas asistencia, estamos disponibles para ayudarte.
        </p>
        <div className="mt-5 flex flex-col gap-2.5">
          <a
            href={support.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 font-bold text-white shadow-soft transition-transform hover:scale-[1.02]"
          >
            Contactar por WhatsApp
          </a>
          <Link to="/ayuda" className="inline-flex items-center justify-center rounded-2xl border border-border bg-surface px-5 py-3 font-bold text-text-primary">
            Preguntas frecuentes
          </Link>
        </div>
      </div>
    </section>
  )
}
