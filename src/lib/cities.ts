import type { Business, DeliveryZone, Product } from '../types'

/** Localidades con catálogo propio (mismos `City.code` que usa Tráelo normal). */
export type CityCode = 'guira-de-melena' | 'san-antonio-de-los-banos'

export interface CityOption {
  code: CityCode
  name: string
  /** Nombre corto para espacios chicos (selector del header). */
  short: string
  zone: Exclude<DeliveryZone, 'otro'>
}

export const DEFAULT_CITY_CODE: CityCode = 'guira-de-melena'

export const CITIES: readonly CityOption[] = [
  { code: 'guira-de-melena', name: 'Güira de Melena', short: 'Güira de Melena', zone: 'guira' },
  { code: 'san-antonio-de-los-banos', name: 'San Antonio de los Baños', short: 'San Antonio', zone: 'san-antonio' },
]

export function findCity(code: string | null | undefined): CityOption | null {
  return CITIES.find((c) => c.code === code) ?? null
}

/** Un negocio sin `cityCode` (catálogo anterior a la separación) es de Güira, como siempre. */
export function cityOfBusiness(business: Pick<Business, 'cityCode'>): CityCode {
  return findCity(business.cityCode)?.code ?? DEFAULT_CITY_CODE
}

export function businessesOfCity(businesses: Business[], code: CityCode): Business[] {
  return businesses.filter((b) => cityOfBusiness(b) === code)
}

export function productsOfBusinesses(products: Product[], businesses: Business[]): Product[] {
  const ids = new Set(businesses.map((b) => b.id))
  return products.filter((p) => ids.has(p.businessId))
}

/** Zona de entrega que corresponde a una localidad. */
export function zoneOfCity(code: CityCode): DeliveryZone {
  return findCity(code)?.zone ?? 'guira'
}

export function cityOfZone(zone: DeliveryZone): CityCode | null {
  return CITIES.find((c) => c.zone === zone)?.code ?? null
}

export const ZONE_OPTIONS: { zone: DeliveryZone; label: string }[] = [
  { zone: 'guira', label: 'Güira de Melena' },
  { zone: 'san-antonio', label: 'San Antonio de los Baños' },
  { zone: 'otro', label: 'Otro lugar' },
]

export function zoneLabel(zone: DeliveryZone | undefined): string {
  return ZONE_OPTIONS.find((z) => z.zone === (zone ?? 'guira'))?.label ?? 'Güira de Melena'
}

export interface SupportContact {
  /** Formato internacional, sin "+". */
  whatsapp: string
  whatsappUrl: string
  phoneLabel: string
}

const GUIRA_SUPPORT: SupportContact = {
  whatsapp: '5358365388',
  whatsappUrl: 'https://wa.me/5358365388',
  phoneLabel: '+53 5 8365388',
}

const SUPPORT_BY_CITY: Partial<Record<CityCode, SupportContact>> = {
  'san-antonio-de-los-banos': {
    whatsapp: '5358202510',
    whatsappUrl: 'https://wa.me/5358202510',
    phoneLabel: '+53 5 8202510',
  },
}

/** WhatsApp/teléfono de soporte según la localidad (San Antonio tiene el suyo). */
export function supportContactFor(code: CityCode | null | undefined): SupportContact {
  return (code && SUPPORT_BY_CITY[code]) || GUIRA_SUPPORT
}
