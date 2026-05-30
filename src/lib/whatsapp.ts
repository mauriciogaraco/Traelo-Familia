import type { Order } from '../types'
import { formatPrice } from './format'

/** Número del negocio/repartidor que recibe los pedidos (formato internacional, sin +). */
export const WHATSAPP_NUMBER = '5358365388'

/** Construye el texto del pedido tal como lo recibirá el negocio por WhatsApp. */
export function buildOrderMessage(order: Order): string {
  const { id, address, items, total } = order

  const lines = [
    `*Pedido #${id}* — Tráelo`,
    '',
    `*Cliente:* ${address.nombre} ${address.apellidos}`,
    `*Dirección:* ${address.direccion}`,
    `*Teléfono:* ${address.telefono}`,
    '',
    '*Productos:*',
    ...items.map((i) => `• ${i.product.name} x ${i.quantity} — ${formatPrice(i.product.price * i.quantity)}`),
    '',
    `*Total: ${formatPrice(total)}*`,
  ]

  return lines.join('\n')
}

/** Devuelve la URL wa.me lista para abrir con el pedido pre-cargado. */
export function buildWhatsAppUrl(order: Order): string {
  const text = encodeURIComponent(buildOrderMessage(order))
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`
}
