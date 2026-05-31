import { useMemo, useState } from 'react'
import { products, businesses } from '../data/catalog'
import { AddressBar } from '../components/address/AddressBar'
import { BusinessRail } from '../components/home/BusinessRail'
import { CategoryRail } from '../components/home/CategoryRail'
import { ProductCard } from '../components/product/ProductCard'
import { EmptyState } from '../components/ui/EmptyState'
import { Logo } from '../components/ui/Logo'
import type { Category } from '../types'

export function HomePage() {
  const [query, setQuery] = useState('')
  const [business, setBusiness] = useState<string | null>(null)
  const [category, setCategory] = useState<Category | 'Todos'>('Todos')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return products.filter((p) => {
      const matchQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.businessName.toLowerCase().includes(q)
      const matchBusiness = !business || p.businessId === business
      const matchCategory = category === 'Todos' || p.category === category
      return matchQuery && matchBusiness && matchCategory
    })
  }, [query, business, category])

  const searching = query.trim().length > 0
  const activeBiz = businesses.find((b) => b.id === business)

  return (
    <div className="animate-fade-in">
      {/* Cabecera: logo + dirección + buscador */}
      <header className="bg-gradient-warm px-4 pt-4 pb-5 rounded-b-[1.75rem] border-b border-border/70">
        <div className="flex items-center gap-2">
          <Logo />
          <div className="ml-auto min-w-0">
            <AddressBar variant="pill" />
          </div>
        </div>

        <div className="relative mt-3">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary"
            width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}
          >
            <circle cx="11" cy="11" r="7" />
            <path strokeLinecap="round" d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="¿Qué estás buscando hoy?"
            className="w-full h-14 pl-12 pr-4 rounded-2xl bg-surface border border-border text-[15px] text-text-primary placeholder:text-text-secondary shadow-soft focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/40"
            aria-label="Buscar productos"
          />
        </div>
      </header>

      <div className="px-4">
        {/* Negocios destacados */}
        <section className="pt-4">
          <SectionTitle
            title="Negocios"
            action={
              activeBiz ? (
                <button onClick={() => setBusiness(null)} className="text-xs font-bold text-primary">
                  Ver todos
                </button>
              ) : undefined
            }
          />
          <BusinessRail businesses={businesses} selectedId={business} onSelect={setBusiness} />
        </section>

        {/* Categorías */}
        <section className="pt-5">
          <SectionTitle title="Categorías" />
          <CategoryRail selected={category} onSelect={setCategory} />
        </section>

        {/* Productos */}
        <section className="pt-6">
          <SectionTitle
            title={searching ? 'Resultados' : 'Productos destacados'}
            action={
              <span className="text-xs font-semibold text-text-secondary">
                {filtered.length} {filtered.length === 1 ? 'producto' : 'productos'}
              </span>
            }
          />

          {filtered.length === 0 ? (
            <EmptyState
              icon="🔎"
              title="Sin resultados"
              description="No encontramos productos con esos filtros. Prueba con otra palabra o categoría."
            />
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

function SectionTitle({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-end justify-between mb-3">
      <h2 className="flex items-center gap-2.5 text-[1.35rem] font-extrabold text-text-primary tracking-[-0.02em]">
        <span className="w-1.5 h-6 rounded-full bg-gradient-primary" aria-hidden="true" />
        {title}
      </h2>
      {action && <div className="pb-0.5">{action}</div>}
    </div>
  )
}
