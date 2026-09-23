import type { Order } from '../types'

const COOLDOWN_MS = 3 * 60 * 1000
const LAST_SENT_KEY = 'traelo_last_order_sent'

function markSent(at: number) {
  try {
    localStorage.setItem(LAST_SENT_KEY, String(at))
  } catch {
    // sin storage no hay cooldown local; el servidor lo aplica igual
  }
}

/** Milisegundos que faltan para poder enviar otro pedido (0 si ya se puede). */
export function orderCooldownRemaining(): number {
  try {
    const last = Number(localStorage.getItem(LAST_SENT_KEY))
    if (!last) return 0
    return Math.max(0, last + COOLDOWN_MS - Date.now())
  } catch {
    return 0
  }
}

export function cooldownMessage(ms: number): string {
  const secs = Math.ceil(ms / 1000)
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `Espera ${m}:${String(s).padStart(2, '0')} min antes de enviar otro pedido.`
}

/** Envía el pedido al servidor (/api/order), que lo valida y lo reenvía a Telegram. */
export async function sendOrderToTelegram(order: Order): Promise<boolean> {
  if (orderCooldownRemaining() > 0) return false
  try {
    const res = await fetch('/api/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: order.id,
        address: order.address,
        items: order.items.map(i => ({
          product: { id: i.product.id },
          quantity: i.quantity,
          option: i.option,
          addon: i.addon ? { name: i.addon.name } : undefined,
          packaging: i.packaging ? { name: i.packaging.name } : undefined,
        })),
      }),
    })
    const data = await res.json().catch(() => null)

    if (res.status === 429 && typeof data?.retryAfter === 'number') {
      markSent(Date.now() - COOLDOWN_MS + data.retryAfter * 1000)
      return false
    }
    if (res.ok && data?.ok === true) {
      markSent(Date.now())
      return true
    }
    return false
  } catch {
    return false
  }
}
