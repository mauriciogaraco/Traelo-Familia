import { Link } from 'react-router-dom'
import type { Business } from '../../types'
import { LazyImage } from '../ui/LazyImage'

interface BusinessCardProps {
  business: Business
  productCount?: number
  /** `rail`: ancho fijo para filas con scroll horizontal; `grid`: ocupa su celda. */
  layout?: 'rail' | 'grid'
}

export function BusinessCard({ business, productCount, layout = 'grid' }: BusinessCardProps) {
  return (
    <Link
      to={`/negocio/${business.id}`}
      className={`block rounded-3xl border border-border bg-surface overflow-hidden shadow-card hover:shadow-card-hover transition-all active:scale-[0.98] ${
        layout === 'rail' ? 'w-[168px] flex-shrink-0' : ''
      }`}
    >
      <LazyImage src={business.image} alt={business.name} className="h-24 w-full" placeholderClassName={business.color} />
      <div className="p-3">
        <p className="text-sm font-bold text-text-primary leading-tight line-clamp-1">{business.name}</p>
        <p className="flex items-center gap-1 text-[11px] font-semibold text-success mt-1">
          <span className="w-1.5 h-1.5 rounded-full bg-success" />
          Aceptando pedidos
        </p>
        {productCount !== undefined && (
          <p className="text-[11px] text-text-secondary mt-0.5">
            {productCount} {productCount === 1 ? 'producto' : 'productos'}
          </p>
        )}
      </div>
    </Link>
  )
}
