import { useLocation, useNavigate } from 'react-router-dom'
import { useOrders } from '../context/OrdersContext'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { formatDate, formatPrice } from '../lib/format'
import { buildWhatsAppUrl } from '../lib/whatsapp'
import type { Order } from '../types'

const statusConfig = {
  pendiente: { label: 'Pendiente', className: 'bg-amber-50 text-warning' },
  completado: { label: 'Completado', className: 'bg-green-50 text-success' },
}

export function OrdersPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { orders, markCompleted } = useOrders()
  const justOrdered = (location.state as { justOrdered?: string } | null)?.justOrdered

  if (orders.length === 0) {
    return (
      <div className="animate-fade-in">
        <header className="px-4 pt-6 pb-4">
          <h1 className="text-2xl font-bold text-text-primary">Mis pedidos</h1>
        </header>
        <EmptyState
          icon="📦"
          title="Aún no tienes pedidos"
          description="Cuando hagas tu primer pedido aparecerá aquí para que le hagas seguimiento."
          action={<Button size="lg" onClick={() => navigate('/')}>Empezar a comprar</Button>}
        />
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <header className="px-4 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-text-primary">Mis pedidos</h1>
        <p className="text-sm text-text-secondary mt-0.5">
          {orders.length} {orders.length === 1 ? 'pedido' : 'pedidos'}
        </p>
      </header>

      {justOrdered && (
        <div className="mx-4 mb-4 flex items-center gap-2.5 bg-green-50 border border-green-200 rounded-2xl p-3 animate-scale-in">
          <span className="text-lg">✅</span>
          <p className="text-sm font-semibold text-green-800">
            ¡Pedido #{justOrdered} creado! Revisa WhatsApp para enviarlo.
          </p>
        </div>
      )}

      <div className="px-4 space-y-4">
        {orders.map((order) => (
          <OrderCard key={order.id} order={order} onComplete={() => markCompleted(order.id)} />
        ))}
      </div>
    </div>
  )
}

function OrderCard({ order, onComplete }: { order: Order; onComplete: () => void }) {
  const status = statusConfig[order.status]
  return (
    <div className="bg-surface border border-border rounded-3xl overflow-hidden">
      <div className="flex items-start justify-between gap-3 px-4 pt-4 pb-3 border-b border-border">
        <div>
          <p className="text-[11px] font-semibold text-text-secondary">Pedido</p>
          <p className="text-lg font-bold text-text-primary">#{order.id}</p>
          <p className="text-xs text-text-secondary mt-0.5">{formatDate(order.date)}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-bold flex-shrink-0 ${status.className}`}>
          {status.label}
        </span>
      </div>

      <div className="px-4 py-3 space-y-1.5">
        {order.items.map(({ product, quantity }) => (
          <div key={product.id} className="flex items-center justify-between gap-2 text-sm">
            <span className="text-text-primary line-clamp-1 flex-1">
              <span className="mr-1" aria-hidden="true">{product.image}</span>
              {product.name}
              <span className="text-text-secondary"> x {quantity}</span>
            </span>
          </div>
        ))}
      </div>

      <div className="px-4 pb-4 pt-1 border-t border-border flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] text-text-secondary">Total</p>
          <p className="text-lg font-bold text-primary">{formatPrice(order.total)}</p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={buildWhatsAppUrl(order)}
            target="_blank"
            rel="noopener noreferrer"
            className="h-9 px-3 inline-flex items-center gap-1.5 rounded-xl bg-green-50 text-green-700 text-xs font-bold hover:bg-green-100 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2a10 10 0 0 0-8.5 15.3L2 22l4.8-1.4A10 10 0 1 0 12 2Z" />
            </svg>
            WhatsApp
          </a>
          {order.status === 'pendiente' && (
            <button
              onClick={onComplete}
              className="h-9 px-3 rounded-xl border border-border text-xs font-bold text-text-primary hover:border-primary/40 transition-colors"
            >
              Recibido
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
