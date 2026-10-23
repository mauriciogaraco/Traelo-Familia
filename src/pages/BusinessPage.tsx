import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useCatalog } from '../context/CatalogContext'
import { ProductCard } from '../components/product/ProductCard'
import { PaymentNote } from '../components/ui/PaymentNote'
import { LazyImage } from '../components/ui/LazyImage'
import { EmptyState } from '../components/ui/EmptyState'
import { Button } from '../components/ui/Button'
import { cityOfBusiness, findCity } from '../lib/cities'

/** Página de un negocio: portada, localidad y todos sus productos. */
export function BusinessPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { businesses, products, loading } = useCatalog()
  const business = businesses.find((b) => b.id === id)
  const items = useMemo(() => products.filter((p) => p.businessId === id), [products, id])

  function goBack() {
    const idx = (window.history.state?.idx as number | undefined) ?? 0
    if (idx > 0) navigate(-1)
    else navigate('/')
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-7 h-7 border-[2.5px] border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!business) {
    return (
      <EmptyState
        icon="🏪"
        title="No encontramos este negocio"
        description="Puede que ya no esté disponible."
        action={<Button onClick={() => navigate('/buscar?tab=negocios')}>Ver negocios</Button>}
      />
    )
  }

  const city = findCity(cityOfBusiness(business))

  return (
    <div className="animate-fade-in pb-4">
      <div className="relative">
        <LazyImage src={business.image} alt={business.name} className="h-40 w-full" placeholderClassName={business.color} eager />
        <button
          onClick={goBack}
          aria-label="Volver"
          className="absolute top-4 left-4 w-9 h-9 rounded-full bg-surface/90 backdrop-blur border border-border flex items-center justify-center text-text-primary"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      <div className="px-4 pt-4 space-y-3">
        <div>
          <h1 className="text-xl font-extrabold text-text-primary">{business.name}</h1>
          {business.description && <p className="text-sm text-text-secondary mt-0.5">{business.description}</p>}
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-50 text-success text-[11px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-success" />
              Aceptando pedidos
            </span>
            {city && <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-secondary text-text-primary text-[11px] font-bold">📍 {city.name}</span>}
          </div>
        </div>

        {business.paymentNote && (
          <div className="rounded-2xl overflow-hidden border border-amber-100">
            <PaymentNote note={business.paymentNote} />
          </div>
        )}

        <h2 className="text-base font-extrabold text-text-primary pt-1">
          {items.length} {items.length === 1 ? 'producto' : 'productos'}
        </h2>
        {items.length === 0 ? (
          <EmptyState icon="🛍️" title="Sin productos por ahora" description="Vuelve a mirar más tarde." />
        ) : (
          <div className="grid grid-cols-2 gap-3 items-stretch">
            {items.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
