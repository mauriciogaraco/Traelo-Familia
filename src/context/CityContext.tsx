import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Business, Product } from '../types'
import { readStorage, writeStorage, STORAGE_KEYS } from '../lib/storage'
import { businessesOfCity, findCity, productsOfBusinesses, DEFAULT_CITY_CODE, type CityCode } from '../lib/cities'
import { useCatalog } from './CatalogContext'

interface CityContextValue {
  /** Localidad cuyo catálogo se está viendo. */
  cityCode: CityCode
  /** Primera visita: todavía no eligió desde dónde pide. */
  needsChoice: boolean
  setCity: (code: CityCode) => void
}

const CityContext = createContext<CityContextValue | null>(null)

export function CityProvider({ children }: { children: ReactNode }) {
  const [stored, setStored] = useState<CityCode | null>(() => findCity(readStorage<string | null>(STORAGE_KEYS.city, null))?.code ?? null)

  useEffect(() => {
    if (stored) writeStorage(STORAGE_KEYS.city, stored)
  }, [stored])

  const setCity = useCallback((code: CityCode) => setStored(code), [])

  const value = useMemo<CityContextValue>(
    () => ({ cityCode: stored ?? DEFAULT_CITY_CODE, needsChoice: stored === null, setCity }),
    [stored, setCity],
  )
  return <CityContext.Provider value={value}>{children}</CityContext.Provider>
}

export function useCity() {
  const ctx = useContext(CityContext)
  if (!ctx) throw new Error('useCity debe usarse dentro de CityProvider')
  return ctx
}

/** Catálogo de la localidad activa: solo sus negocios y los productos de esos negocios. */
export function useCityCatalog(): { businesses: Business[]; products: Product[]; loading: boolean; syncing: boolean } {
  const { businesses, products, loading, syncing } = useCatalog()
  const { cityCode } = useCity()
  return useMemo(() => {
    const cityBusinesses = businessesOfCity(businesses, cityCode)
    return { businesses: cityBusinesses, products: productsOfBusinesses(products, cityBusinesses), loading, syncing }
  }, [businesses, products, cityCode, loading, syncing])
}
