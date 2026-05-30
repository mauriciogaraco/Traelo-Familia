import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Address, CartItem, Order } from '../types'
import { readStorage, writeStorage, STORAGE_KEYS } from '../lib/storage'

interface OrdersContextValue {
  orders: Order[]
  createOrder: (items: CartItem[], address: Address) => Order
  markCompleted: (orderId: string) => void
}

const OrdersContext = createContext<OrdersContextValue | null>(null)

function generateOrderId(): string {
  // Pedido #XXXX — 4 dígitos legibles
  return Math.floor(1000 + Math.random() * 9000).toString()
}

export function OrdersProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>(() =>
    readStorage<Order[]>(STORAGE_KEYS.orders, [])
  )

  useEffect(() => {
    writeStorage(STORAGE_KEYS.orders, orders)
  }, [orders])

  function createOrder(items: CartItem[], address: Address): Order {
    const order: Order = {
      id: generateOrderId(),
      date: new Date().toISOString(),
      items,
      total: items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
      status: 'pendiente',
      address,
    }
    setOrders((prev) => [order, ...prev])
    return order
  }

  function markCompleted(orderId: string) {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'completado' as const } : o))
    )
  }

  return (
    <OrdersContext.Provider value={{ orders, createOrder, markCompleted }}>
      {children}
    </OrdersContext.Provider>
  )
}

export function useOrders() {
  const ctx = useContext(OrdersContext)
  if (!ctx) throw new Error('useOrders debe usarse dentro de OrdersProvider')
  return ctx
}
