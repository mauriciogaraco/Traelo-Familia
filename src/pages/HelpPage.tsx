import { Link } from 'react-router-dom'
import { useCity } from '../context/CityContext'
import { supportContactFor } from '../lib/cities'

interface Faq {
  question: string
  answer: string
}
interface FaqGroup {
  title: string
  emoji: string
  faqs: Faq[]
}

const GROUPS: FaqGroup[] = [
  {
    title: 'Tu pedido',
    emoji: '🛒',
    faqs: [
      {
        question: '¿Necesito una cuenta para comprar?',
        answer: 'No. Solo necesitas tu nombre, tu WhatsApp y los datos de quien recibe. Tus datos se guardan en este navegador para la próxima vez.',
      },
      {
        question: '¿Cómo sé si mi pedido fue recibido?',
        answer: 'Al confirmar verás el número de pedido y su detalle en "Mis pedidos". Además te escribimos por WhatsApp para coordinar el pago.',
      },
      {
        question: '¿Puedo cambiar mi pedido después de confirmarlo?',
        answer: 'Escríbenos por WhatsApp cuanto antes y te ayudamos a ajustarlo.',
      },
      {
        question: '¿Puedo comprar en varios negocios a la vez?',
        answer: 'Sí, pero cada pedido se entrega en una sola zona. Si compras en Güira y en San Antonio, haz un pedido por cada localidad.',
      },
    ],
  },
  {
    title: 'Entrega',
    emoji: '🚀',
    faqs: [
      {
        question: '¿A dónde entregan?',
        answer: 'En Güira de Melena y en San Antonio de los Baños. Al hacer el pedido eliges la zona de entrega. Si es en otro lugar, elige "Otro lugar" y escribe el municipio: te confirmamos por WhatsApp si llegamos y cómo.',
      },
      {
        question: '¿Cuánto cuesta la mensajería?',
        answer: 'Va incluida en el precio de los productos en Güira y San Antonio. Para otros lugares te confirmamos el costo por WhatsApp antes de cobrar.',
      },
      {
        question: '¿Cómo cambio entre Güira y San Antonio?',
        answer: 'Con el selector de localidad de arriba ("Negocios de..."). Cada localidad muestra sus propios negocios.',
      },
      {
        question: '¿Puedo pedir que llamen antes de entregar?',
        answer: 'Sí. Escríbelo en "Observaciones" al completar los datos del pedido.',
      },
    ],
  },
  {
    title: 'Pagos',
    emoji: '💳',
    faqs: [
      {
        question: '¿Cómo se paga?',
        answer: 'Por Zelle. Al confirmar el pedido te contactamos por WhatsApp con los datos para pagar. No se hace ningún cargo automático.',
      },
      {
        question: '¿Qué es la comisión de Zelle?',
        answer: 'Es un 10% sobre el subtotal que se suma al total a pagar. Lo ves desglosado antes de confirmar.',
      },
      {
        question: '¿En qué moneda están los precios?',
        answer: 'En dólares (USD).',
      },
    ],
  },
  {
    title: 'Productos',
    emoji: '🛍️',
    faqs: [
      {
        question: '¿Qué pasa si un producto está agotado?',
        answer: 'Se ve con la etiqueta "Agotado" y no se puede agregar al carrito.',
      },
      {
        question: '¿Puedo personalizar un combo?',
        answer: 'Sí. Escríbenos por WhatsApp y armamos el tuyo a tu gusto.',
      },
      {
        question: '¿Qué es el tipo, el agrego y el envase?',
        answer: 'Algunos productos piden elegir un tipo o sabor. El agrego es un extra opcional y el envase tiene su propio costo. Los ves al abrir el producto.',
      },
    ],
  },
]

function FaqAccordion({ faq }: { faq: Faq }) {
  return (
    <details className="group border-b border-border last:border-b-0">
      <summary className="flex items-center justify-between gap-3 px-4 py-3.5 cursor-pointer list-none font-semibold text-[15px] text-text-primary marker:content-none">
        <span>{faq.question}</span>
        <svg
          className="shrink-0 text-text-secondary transition-transform group-open:rotate-180"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
        </svg>
      </summary>
      <p className="px-4 pb-4 text-sm text-text-secondary">{faq.answer}</p>
    </details>
  )
}

/** Ayuda — contacto (WhatsApp/llamar) según la localidad activa y preguntas frecuentes por tema. */
export function HelpPage() {
  const { cityCode } = useCity()
  const support = supportContactFor(cityCode)

  return (
    <div className="px-4 pt-4 pb-6 space-y-4 animate-fade-in">
      <h1 className="text-xl font-extrabold text-text-primary">Ayuda</h1>

      <div className="rounded-2xl bg-gradient-primary p-5 text-white shadow-btn-primary space-y-1">
        <h2 className="text-lg font-extrabold">¿Necesitas ayuda?</h2>
        <p className="text-sm opacity-95">Escríbenos o llámanos, estamos para ayudarte con tu pedido.</p>
        <div className="flex gap-3 pt-3">
          <a
            href={support.whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="flex-1 min-h-12 inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 font-bold text-text-primary"
          >
            <span className="text-success" aria-hidden="true">●</span>
            WhatsApp
          </a>
          <a
            href={`tel:+${support.whatsapp}`}
            className="flex-1 min-h-12 inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 font-bold text-text-primary"
          >
            <span aria-hidden="true">📞</span>
            Llamar
          </a>
        </div>
        <p className="text-xs opacity-90 pt-1">{support.phoneLabel}</p>
      </div>

      {GROUPS.map((group) => (
        <section key={group.title} className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xl" aria-hidden="true">
              {group.emoji}
            </span>
            <h2 className="text-base font-extrabold text-text-primary">{group.title}</h2>
          </div>
          <div className="rounded-2xl bg-surface border border-border/60 overflow-hidden">
            {group.faqs.map((faq) => (
              <FaqAccordion key={faq.question} faq={faq} />
            ))}
          </div>
        </section>
      ))}

      <Link to="/pedidos" className="block rounded-2xl bg-surface border border-border/60 px-4 py-3.5 font-semibold text-text-primary">
        🧾 Ver mis pedidos
      </Link>

      <p className="text-center text-xs text-text-secondary pt-2">¿No encuentras lo que buscas? Escríbenos por WhatsApp.</p>
    </div>
  )
}
