import type { Product } from '../types'

/** Lista de líquidos/bebidas compartida (misma carta para varios negocios). */
const DRINKS: { key: string; name: string; price: number; image: string }[] = [
  { key: 'ref-naranja', name: 'Ref. Naranja', price: 300, image: '🥤' },
  { key: 'ref-limon', name: 'Ref. Limón', price: 300, image: '🥤' },
  { key: 'malta-guajira', name: 'Malta Guajira 1.5 L', price: 1200, image: '🍺' },
  { key: 'malta', name: 'Malta', price: 450, image: '🍺' },
  { key: 'jugo-cajita', name: 'Jugo de Cajita', price: 240, image: '🧃' },
  { key: 'chaka', name: 'Chaka', price: 500, image: '🥤' },
  { key: 'energizante-grande', name: 'Energizante Grande', price: 500, image: '⚡' },
  { key: 'energizante-xl', name: 'Energizante XL', price: 380, image: '⚡' },
  { key: 'cerv-shekels', name: 'Cerv. Shekels', price: 380, image: '🍺' },
  { key: 'cerv-becks', name: 'Cerv. Becks', price: 350, image: '🍺' },
  { key: 'cerv-beer-azul', name: 'Cerv. Beer Azul', price: 350, image: '🍺' },
  { key: 'cerv-muralla', name: 'Cerv. Muralla', price: 350, image: '🍺' },
  { key: 'kermato', name: 'Kermato', price: 800, image: '🥤' },
  { key: 'agua-natural', name: 'Agua Natural', price: 180, image: '💧' },
]

/** Genera la carta de bebidas para un negocio concreto (ids con prefijo propio). */
export function makeDrinks(businessId: string, businessName: string, prefix: string): Product[] {
  return DRINKS.map((d) => ({
    id: `${prefix}-${d.key}`,
    name: d.name,
    businessId,
    businessName,
    category: 'Bebidas',
    shortDescription: '',
    longDescription: 'Se vende por unidad.',
    image: d.image,
    price: d.price,
    stockStatus: 'disponible',
  }))
}
