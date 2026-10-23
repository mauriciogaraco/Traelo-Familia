import type { Business, Product } from '../types'

/** Minúsculas y sin acentos, para que "panaderia" encuentre "Panadería". */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

function matches(haystack: string[], query: string): boolean {
  const terms = normalize(query).split(/\s+/).filter(Boolean)
  if (terms.length === 0) return true
  const text = haystack.map(normalize).join(' ')
  return terms.every((t) => text.includes(t))
}

export function searchBusinesses(query: string, businesses: Business[]): Business[] {
  if (!query.trim()) return businesses
  return businesses.filter((b) => matches([b.name, b.description], query))
}

export function searchProducts(query: string, products: Product[]): Product[] {
  if (!query.trim()) return products
  return products.filter((p) => matches([p.name, p.businessName, p.category, p.shortDescription], query))
}

export type ProductSort = 'relevance' | 'priceAsc' | 'priceDesc' | 'alphabetical'

export function sortProducts(products: Product[], sort: ProductSort): Product[] {
  const list = [...products]
  switch (sort) {
    case 'priceAsc':
      return list.sort((a, b) => a.price - b.price)
    case 'priceDesc':
      return list.sort((a, b) => b.price - a.price)
    case 'alphabetical':
      return list.sort((a, b) => a.name.localeCompare(b.name, 'es'))
    default:
      return list
  }
}

export function sortBusinessesAlpha(businesses: Business[]): Business[] {
  return [...businesses].sort((a, b) => a.name.localeCompare(b.name, 'es'))
}
