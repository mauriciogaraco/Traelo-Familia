export type StockStatus = 'disponible' | 'pocas' | 'agotado'

export type Category =
  | 'Combos'
  | 'Comidas'
  | 'Regalos'
  | 'Bebidas'
  | 'Panadería'

export interface BusinessSchedule {
  days: number[]
  open: string
  close: string
  label: string
}

export type DeliveryZone = 'guira' | 'san-antonio' | 'otro'

export interface Business {
  id: string
  /** `City.code` de la localidad del negocio. Sin él = Güira de Melena. */
  cityCode?: 'guira-de-melena' | 'san-antonio-de-los-banos'
  name: string
  description: string
  image: string
  color: string
  paymentNote?: string
  deliveryFee?: number
  status?: 'cerrado'
  schedule?: BusinessSchedule
}

export interface Addon {
  name: string
  price: number
}

export interface Packaging {
  name: string
  price: number
}

export interface Product {
  id: string
  name: string
  businessId: string
  businessName: string
  category: Category
  shortDescription: string
  longDescription: string
  image: string
  photo?: string
  price: number
  formato?: number
  options?: string[]
  addons?: Addon[]
  packaging?: Packaging[]
  stockStatus: StockStatus
}

export interface CartItem {
  product: Product
  quantity: number
  option?: string
  addon?: Addon
  packaging?: Packaging
}

export interface Address {
  /** Dónde se entrega. Pedidos guardados antes de las zonas no lo traen: se asume Güira. */
  zona?: DeliveryZone
  /** Solo con zona "otro": municipio/provincia que escribió el comprador. */
  lugar?: string
  nombreComprador: string
  whatsappComprador: string
  nombreDestinatario: string
  direccion: string
  observaciones?: string
}

export type OrderStatus = 'pendiente' | 'completado'

export interface Order {
  id: string
  date: string
  items: CartItem[]
  subtotal?: number
  fee?: number
  total: number
  delivery?: string
  status: OrderStatus
  address: Address
}
