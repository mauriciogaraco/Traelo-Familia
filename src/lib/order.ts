import type { Address, CartItem, Order } from '../types'
import { lineTotal } from './cart'
import { MESSAGING_FEE } from './config'

export interface BusinessGroup {
  businessId: string
  businessName: string
  items: CartItem[]
  subtotal: number
}

/** Agrupa los productos del carrito/pedido por negocio, conservando el orden de aparición. */
export function groupByBusiness(items: CartItem[]): BusinessGroup[] {
  const map = new Map<string, BusinessGroup>()
  for (const item of items) {
    const { businessId, businessName } = item.product
    let group = map.get(businessId)
    if (!group) {
      group = { businessId, businessName, items: [], subtotal: 0 }
      map.set(businessId, group)
    }
    group.items.push(item)
    group.subtotal += lineTotal(item)
  }
  return [...map.values()]
}

function generateOrderId(): string {
  // Pedido #XXXX — 4 dígitos legibles
  return Math.floor(1000 + Math.random() * 9000).toString()
}

/** Construye un pedido (sin persistir) a partir del carrito y la dirección. */
export function makeOrder(items: CartItem[], address: Address): Order {
  const subtotal = items.reduce((sum, i) => sum + lineTotal(i), 0)
  const fee = items.length > 0 ? MESSAGING_FEE : 0
  return {
    id: generateOrderId(),
    date: new Date().toISOString(),
    items: items.map((i) => ({ ...i })),
    subtotal,
    fee,
    total: subtotal + fee,
    status: 'pendiente',
    address,
  }
}
