import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useCity, useCityCatalog } from '../context/CityContext'
import { BusinessCard } from '../components/catalog/BusinessCard'
import { Rail, Section } from '../components/catalog/Section'
import { SearchLink } from '../components/catalog/SearchLink'
import { ProductCard } from '../components/product/ProductCard'
import { ShareSection } from '../components/home/ShareSection'
import { HowItWorks } from '../components/home/HowItWorks'
import { SupportSection } from '../components/home/SupportSection'
import { CityEmpty } from '../components/home/CityEmpty'
import { categories, categoryEmoji } from '../data/catalog'
import { findCity } from '../lib/cities'
import { sortBusinessesAlpha } from '../lib/search'

const TOP_BUSINESSES_LIMIT = 10
const TOP_PRODUCTS_LIMIT = 10

/**
 * Home — mismas secciones que Tráelo: buscador, categorías, ofertas destacadas (combos), acceso a todos
 * los negocios, negocios, productos, compartir y ayuda. Sin puntos ni mandado. Todo sale del catálogo de
 * la localidad activa.
 */
export function HomePage() {
  const { businesses, products, loading } = useCityCatalog()
  const { cityCode } = useCity()
  const cityName = findCity(cityCode)?.name ?? ''

  const productCountByBusiness = useMemo(() => {
    const map = new Map<string, number>()
    for (const p of products) map.set(p.businessId, (map.get(p.businessId) ?? 0) + 1)
    return map
  }, [products])

  const categoriesInUse = useMemo(() => {
    const used = new Set(products.map((p) => p.category))
    return categories.filter((c) => used.has(c))
  }, [products])

  const combos = useMemo(() => products.filter((p) => p.category === 'Combos' && p.stockStatus !== 'agotado'), [products])

  // Sin estadísticas de ventas en Familia: los negocios con más productos van primero.
  const topBusinesses = useMemo(
    () =>
      sortBusinessesAlpha(businesses)
        .filter((b) => (productCountByBusiness.get(b.id) ?? 0) > 0)
        .sort((a, b) => (productCountByBusiness.get(b.id) ?? 0) - (productCountByBusiness.get(a.id) ?? 0))
        .slice(0, TOP_BUSINESSES_LIMIT),
    [businesses, productCountByBusiness],
  )

  // Sin estadísticas de ventas: un producto por negocio (con foto si tiene) (en el orden de Top Negocios) para que
  // la fila tenga variedad y no sea solo la A de la lista.
  const topProducts = useMemo(() => {
    const picked: typeof products = []
    for (const business of topBusinesses) {
      const own = products.filter((p) => p.businessId === business.id && p.stockStatus !== 'agotado' && p.category !== 'Combos')
      const first = own.find((p) => p.photo) ?? own[0]
      if (first) picked.push(first)
      if (picked.length === TOP_PRODUCTS_LIMIT) break
    }
    return picked
  }, [products, topBusinesses])

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-3 py-16">
        <div className="w-7 h-7 border-[2.5px] border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold text-text-secondary">Cargando catálogo...</p>
      </div>
    )
  }

  return (
    <div className="px-4 pt-4 space-y-6 animate-fade-in">
      <section className="rounded-[24px] bg-gradient-primary p-4 space-y-1 shadow-btn-primary">
        <h1 className="text-[1.6rem] leading-tight font-extrabold text-white">¿Qué le llevamos hoy a tu familia?</h1>
        <p className="text-sm text-white/95 pb-2">Compra desde donde estés y se lo entregamos en {cityName}.</p>
        <SearchLink />
      </section>

      {businesses.length === 0 ? (
        <CityEmpty />
      ) : (
        <>
          {categoriesInUse.length > 0 && (
            <Section title="Categorías">
              <div className="flex gap-3 overflow-x-auto scrollbar-none -mx-4 px-4 pb-1">
                {categoriesInUse.map((category) => (
                  <Link
                    key={category}
                    to={`/buscar?tab=productos&categoria=${encodeURIComponent(category)}`}
                    className="flex flex-col items-center gap-1.5 w-[72px] flex-shrink-0 active:scale-95 transition-transform"
                  >
                    <span className="w-[60px] h-[60px] rounded-2xl bg-surface border border-border flex items-center justify-center text-3xl shadow-soft" aria-hidden="true">
                      {categoryEmoji[category]}
                    </span>
                    <span className="text-[11px] leading-tight text-center font-semibold text-text-secondary line-clamp-2">{category}</span>
                  </Link>
                ))}
              </div>
            </Section>
          )}

          {combos.length > 0 && (
            <Section
              title="Ofertas destacadas"
              action={
                <Link to="/buscar?tab=productos&categoria=Combos" className="text-sm font-semibold text-primary hover:underline">
                  Ver todas
                </Link>
              }
            >
              <Rail>
                {combos.map((product) => (
                  <div key={product.id} className="w-[172px] flex-shrink-0">
                    <ProductCard product={product} />
                  </div>
                ))}
              </Rail>
            </Section>
          )}

          <Link
            to="/buscar?tab=negocios"
            className="flex items-center gap-3 rounded-3xl border border-border bg-gradient-warm p-4 active:scale-[0.99] transition-transform"
          >
            <span className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-xl flex-shrink-0" aria-hidden="true">
              🏪
            </span>
            <span className="flex-1 min-w-0">
              <span className="block text-sm font-bold text-text-primary">Ver todos los negocios</span>
              <span className="block text-xs text-text-secondary">
                {businesses.length} en {cityName}
              </span>
            </span>
            <span className="text-text-secondary" aria-hidden="true">
              ›
            </span>
          </Link>

          {topBusinesses.length > 0 && (
            <Section
              title="Top Negocios"
              action={
                <Link to="/buscar?tab=negocios" className="text-sm font-semibold text-primary hover:underline">
                  Ver todos
                </Link>
              }
            >
              <Rail>
                {topBusinesses.map((business) => (
                  <BusinessCard key={business.id} business={business} productCount={productCountByBusiness.get(business.id)} layout="rail" />
                ))}
              </Rail>
            </Section>
          )}

          {topProducts.length > 0 && (
            <Section
              title="Productos top"
              action={
                <Link to="/buscar?tab=productos" className="text-sm font-semibold text-primary hover:underline">
                  Ver todos
                </Link>
              }
            >
              <Rail>
                {topProducts.map((product) => (
                  <div key={product.id} className="w-[172px] flex-shrink-0">
                    <ProductCard product={product} />
                  </div>
                ))}
              </Rail>
            </Section>
          )}
        </>
      )}

      <Section title="¿Cómo funciona?">
        <HowItWorks />
      </Section>

      <ShareSection />
      <SupportSection />
    </div>
  )
}
