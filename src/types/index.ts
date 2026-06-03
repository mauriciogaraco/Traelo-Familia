/**
 * Estados de stock. Al ser un union estricto, TypeScript obliga a usar uno de
 * estos valores: para marcar un producto como agotado basta `stockStatus: 'agotado'`.
 */
export type StockStatus = 'disponible' | 'pocas' | 'agotado'

export type Category =
  | 'Alimentos'
  | 'Bebidas'
  | 'Aseo'
  | 'Hogar'
  | 'Comida'

export interface Business {
  id: string
  name: string
  description: string
  /** Imagen del negocio (URL importada o ruta). */
  image: string
  /** Tailwind gradient classes para el placeholder mientras carga la imagen. */
  color: string
}

export interface Product {
  id: string
  name: string
  businessId: string
  businessName: string
  category: Category
  shortDescription: string
  longDescription: string
  /** Emoji de respaldo (se muestra si no hay foto). */
  image: string
  /** Foto real del producto (URL importada). Opcional. */
  photo?: string
  price: number
  stockStatus: StockStatus
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface Address {
  nombre: string
  apellidos: string
  telefono: string
  direccion: string
  /** Detalle opcional: "al doblar de la farmacia", "frente al parque", etc. */
  referencia?: string
}

export type OrderStatus = 'pendiente' | 'completado'

export interface Order {
  id: string
  date: string
  items: CartItem[]
  total: number
  status: OrderStatus
  address: Address
}
