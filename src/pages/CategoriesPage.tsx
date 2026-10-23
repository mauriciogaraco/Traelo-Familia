import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useCityCatalog } from '../context/CityContext'
import { CityEmpty } from '../components/home/CityEmpty'
import { categories, categoryEmoji } from '../data/catalog'

/** Categorías — todas las que tienen productos en la localidad activa; cada una abre Buscar ya filtrada. */
export function CategoriesPage() {
  const { products, businesses, loading } = useCityCatalog()

  const counts = useMemo(() => {
    const map = new Map<string, number>()
    for (const p of products) map.set(p.category, (map.get(p.category) ?? 0) + 1)
    return map
  }, [products])

  const inUse = categories.filter((c) => (counts.get(c) ?? 0) > 0)

  return (
    <div className="px-4 pt-4 pb-6 space-y-4 animate-fade-in">
      <h1 className="text-xl font-extrabold text-text-primary">Categorías</h1>
      {loading ? null : businesses.length === 0 ? (
        <CityEmpty />
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {inUse.map((category) => (
            <Link
              key={category}
              to={`/buscar?tab=productos&categoria=${encodeURIComponent(category)}`}
              className="flex flex-col items-center gap-2 rounded-3xl border border-border bg-surface p-5 text-center shadow-card hover:shadow-card-hover transition-all active:scale-[0.98]"
            >
              <span className="text-4xl" aria-hidden="true">
                {categoryEmoji[category]}
              </span>
              <span className="font-bold text-text-primary">{category}</span>
              <span className="text-xs text-text-secondary">
                {counts.get(category)} {counts.get(category) === 1 ? 'producto' : 'productos'}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
