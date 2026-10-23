import { useDeferredValue, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useCityCatalog } from '../context/CityContext'
import { BusinessCard } from '../components/catalog/BusinessCard'
import { ChipRow, SegmentedTabs, type ChipItem } from '../components/catalog/Chips'
import { SearchIcon } from '../components/catalog/SearchLink'
import { ProductCard } from '../components/product/ProductCard'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { categories, categoryEmoji } from '../data/catalog'
import { searchBusinesses, searchProducts, sortBusinessesAlpha, sortProducts, type ProductSort } from '../lib/search'
import type { Category } from '../types'

type Tab = 'products' | 'businesses'

const PAGE_SIZE = 20

const SORT_LABELS: Record<ProductSort, string> = {
  relevance: '✨ Relevancia',
  alphabetical: '🔤 A–Z',
  priceAsc: '↑ Menor precio',
  priceDesc: '↓ Mayor precio',
}

/**
 * Buscar — dos pestañas (Negocios | Productos). Sin texto muestra todo el catálogo de la localidad; con
 * texto, los resultados. La búsqueda vive en la URL (`?q=`, `?tab=`, `?categoria=`) para poder enlazarla
 * desde el Home y las categorías.
 */
export function SearchPage() {
  const [params, setParams] = useSearchParams()
  const query = params.get('q') ?? ''
  const urlTab: Tab | null = params.get('tab') === 'productos' ? 'products' : params.get('tab') === 'negocios' ? 'businesses' : null
  const categoryParam = params.get('categoria')
  const category = categories.find((c) => c === categoryParam) ?? null

  const { businesses, products, loading } = useCityCatalog()
  const deferredQuery = useDeferredValue(query)
  const [tabChoice, setTabChoice] = useState<Tab | null>(null)
  const [sort, setSort] = useState<ProductSort>('relevance')
  const [visible, setVisible] = useState(PAGE_SIZE)

  function update(key: string, value: string | null) {
    setVisible(PAGE_SIZE)
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (value) next.set(key, value)
        else next.delete(key)
        return next
      },
      { replace: true },
    )
  }

  const hasQuery = deferredQuery.trim().length > 0
  const matchedBusinesses = useMemo(() => sortBusinessesAlpha(searchBusinesses(deferredQuery, businesses)), [deferredQuery, businesses])
  const matchedProducts = useMemo(() => {
    const found = searchProducts(deferredQuery, products)
    return category ? found.filter((p) => p.category === category) : found
  }, [deferredQuery, products, category])
  const visibleProducts = useMemo(() => sortProducts(matchedProducts, hasQuery ? sort : sort === 'relevance' ? 'alphabetical' : sort), [matchedProducts, sort, hasQuery])

  // Con texto que no coincide con ningún negocio pero sí con productos, se abre en Productos; si la
  // persona elige una pestaña (o el enlace trae una), se respeta.
  const autoTab: Tab = category || (hasQuery && matchedBusinesses.length === 0 && matchedProducts.length > 0) ? 'products' : 'businesses'
  const tab: Tab = tabChoice ?? urlTab ?? autoTab

  const productCountByBusiness = useMemo(() => {
    const map = new Map<string, number>()
    for (const p of products) map.set(p.businessId, (map.get(p.businessId) ?? 0) + 1)
    return map
  }, [products])

  const sortItems: ChipItem[] = (Object.keys(SORT_LABELS) as ProductSort[])
    .filter((key) => key !== 'relevance' || hasQuery)
    .map((key) => ({ key, label: SORT_LABELS[key], selected: (hasQuery ? sort : sort === 'relevance' ? 'alphabetical' : sort) === key }))

  const categoryItems: ChipItem[] = [
    { key: 'all', label: '🛍️ Todas', selected: category === null },
    ...categories.map((c: Category) => ({ key: c, label: `${categoryEmoji[c]} ${c}`, selected: category === c })),
  ]

  const list = tab === 'products' ? visibleProducts : matchedBusinesses
  const shown = list.slice(0, visible)

  return (
    <div className="px-4 pt-4 space-y-3 animate-fade-in">
      <label className="relative block">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="search"
          value={query}
          onChange={(e) => update('q', e.target.value)}
          autoFocus={!query && !urlTab && !category}
          placeholder="Busca negocios o productos"
          aria-label="Buscar negocios o productos"
          className="w-full h-14 pl-12 pr-4 rounded-2xl bg-surface border border-border text-[15px] text-text-primary placeholder:text-text-secondary shadow-soft focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/40"
        />
      </label>

      <SegmentedTabs
        label="Qué buscar"
        value={tab}
        onChange={(key) => {
          setVisible(PAGE_SIZE)
          setTabChoice(key)
        }}
        options={[
          { key: 'businesses', label: 'Negocios', count: matchedBusinesses.length },
          { key: 'products', label: 'Productos', count: matchedProducts.length },
        ]}
      />

      {tab === 'products' && (
        <div className="space-y-2">
          <ChipRow label="Categoría" items={categoryItems} onPress={(key) => update('categoria', key === 'all' ? null : key)} />
          <ChipRow label="Ordenar por" items={sortItems} onPress={(key) => setSort(key as ProductSort)} />
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-7 h-7 border-[2.5px] border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : list.length === 0 ? (
        <EmptyState
          icon="🔎"
          title={tab === 'products' ? 'No encontramos productos' : 'No encontramos negocios'}
          description={hasQuery ? `Sin resultados para “${query.trim()}”.` : 'Todavía no hay nada para mostrar aquí.'}
          action={
            hasQuery || category ? (
              <Button
                variant="outline"
                onClick={() => {
                  setSort('relevance')
                  setParams({}, { replace: true })
                }}
              >
                Quitar búsqueda y filtros
              </Button>
            ) : undefined
          }
        />
      ) : (
        <>
          <h2 className="text-base font-extrabold text-text-primary pt-1" aria-live="polite">
            {hasQuery
              ? `${list.length} ${list.length === 1 ? 'resultado' : 'resultados'} para “${deferredQuery.trim()}”`
              : tab === 'products'
                ? category ?? 'Todos los productos'
                : 'Todos los negocios'}
          </h2>
          {tab === 'products' ? (
            <div className="grid grid-cols-2 gap-3 items-stretch">
              {(shown as typeof visibleProducts).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {(shown as typeof matchedBusinesses).map((business) => (
                <BusinessCard key={business.id} business={business} productCount={productCountByBusiness.get(business.id)} />
              ))}
            </div>
          )}
          {list.length > visible && (
            <div className="flex justify-center py-4">
              <Button variant="soft" onClick={() => setVisible((v) => v + PAGE_SIZE)}>
                Ver más {tab === 'products' ? 'productos' : 'negocios'}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
