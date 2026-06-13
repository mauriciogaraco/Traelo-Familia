import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Business, Product } from '../types'
import { loadCatalog } from '../services/catalog'
import { _setBusinessCache } from '../data/catalog'

interface CatalogState {
  businesses: Business[]
  products: Product[]
  loading: boolean
  syncing: boolean
}

const CatalogContext = createContext<CatalogState>({
  businesses: [],
  products: [],
  loading: true,
  syncing: false,
})

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CatalogState>({
    businesses: [],
    products: [],
    loading: true,
    syncing: false,
  })

  useEffect(() => {
    const { cached, synced } = loadCatalog()

    if (cached) {
      _setBusinessCache(cached.businesses)
      setState({ ...cached, loading: false, syncing: true })
    }

    synced.then((fresh) => {
      if (fresh) {
        _setBusinessCache(fresh.businesses)
        setState({ ...fresh, loading: false, syncing: false })
      } else {
        setState((prev) => ({ ...prev, loading: false, syncing: false }))
      }
    })
  }, [])

  return <CatalogContext.Provider value={state}>{children}</CatalogContext.Provider>
}

export function useCatalog() {
  return useContext(CatalogContext)
}
