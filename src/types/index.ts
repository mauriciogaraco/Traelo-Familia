export type StockStatus = 'disponible' | 'pocas' | 'agotado'

export type Category =
  | 'Alimentos'
  | 'Bebidas'
  | 'Aseo'
  | 'Hogar'
  | 'Electrodomésticos'
  | 'Comida'

export interface Business {
  id: string
  name: string
  description: string
  /** Emoji usado como imagen ligera (sin descargas en redes lentas) */
  image: string
  /** Tailwind gradient classes para el fondo de la tarjeta */
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
  /** Emoji usado como imagen ligera */
  image: string
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
