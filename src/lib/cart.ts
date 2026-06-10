import type { CartItem, Product } from '../types'

/** ¿El producto tiene tipos/sabores a elegir? */
export function hasOptions(product: Product): boolean {
  return Array.isArray(product.options) && product.options.length > 0
}

/** ¿El producto admite agregos (extras)? */
export function hasAddons(product: Product): boolean {
  return Array.isArray(product.addons) && product.addons.length > 0
}

/**
 * Identidad de una línea de carrito: el mismo producto con distinto tipo o
 * distinto agrego cuenta como líneas separadas.
 */
export function lineId(productId: string, option?: string, addonName?: string): string {
  return [productId, option ?? '', addonName ?? ''].join('::')
}

export function itemLineId(item: CartItem): string {
  return lineId(item.product.id, item.option, item.addon?.name)
}

/** Unidades por caja/paquete (1 si el producto se vende por unidad). */
export function packSize(product: Product): number {
  return product.formato && product.formato > 1 ? product.formato : 1
}

/** ¿El producto se vende por caja/paquete (formato > 1)? */
export function hasFormato(product: Product): boolean {
  return packSize(product) > 1
}

/**
 * En el carrito, `quantity` representa el nº de CAJAS/paquetes.
 * Para un producto por unidad, packSize = 1, así que cajas == unidades.
 */
export function unitsOf(item: CartItem): number {
  return item.quantity * packSize(item.product)
}

/** Total de la línea = (precio + agrego) por unidad × unidades totales. */
export function lineTotal(item: CartItem): number {
  const unitPrice = item.product.price + (item.addon?.price ?? 0)
  return unitPrice * unitsOf(item)
}
