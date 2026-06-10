import type { Business, Product, Category } from '../types'

import { bodegaCentral, bodegaCentralProducts } from './businesses/bodega-central'
import { dlm, dlmProducts } from './businesses/el-patio'
import { panesMacus, panesMacusProducts } from './businesses/panes-macus'
import { mercaditoAhorro, mercaditoAhorroProducts } from './businesses/mercadito-ahorro'
import { laMarina, laMarinaProducts } from './businesses/la-marina'

export const categories: Category[] = ['Alimentos', 'Bebidas', 'Aseo', 'Comida', 'Confituras']

export const categoryEmoji: Record<Category, string> = {
  Alimentos: '🥫',
  Bebidas: '🥤',
  Aseo: '🧼',
  Comida: '🍽️',
  Confituras: '🍯',
}

/** Negocios (cada uno definido en su propio archivo en data/businesses/). */
export const businesses: Business[] = [
  bodegaCentral,
  dlm,
  panesMacus,
  mercaditoAhorro,
  laMarina,
]

/** Catálogo completo (productos de todos los negocios). */
export const products: Product[] = [
  ...bodegaCentralProducts,
  ...dlmProducts,
  ...panesMacusProducts,
  ...mercaditoAhorroProducts,
  ...laMarinaProducts,
]

/** Busca un negocio por id (para leer reglas como paymentNote, horario, etc.). */
export function businessById(id: string) {
  return businesses.find((b) => b.id === id)
}

// Aviso en desarrollo: ids de producto duplicados rompen el render (key repetida).
if (import.meta.env.DEV) {
  const seen = new Set<string>()
  const dups = [...new Set(products.filter((p) => seen.size === seen.add(p.id).size).map((p) => p.id))]
  if (dups.length) {
    console.warn('[Tráelo] ⚠️ IDs de producto duplicados (corrígelos):', dups)
  }
}
