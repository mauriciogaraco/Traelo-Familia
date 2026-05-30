import type { StockStatus } from '../../types'

const config: Record<StockStatus, { label: string; dot: string; className: string }> = {
  disponible: {
    label: 'Disponible',
    dot: 'bg-success',
    className: 'bg-green-50 text-success',
  },
  pocas: {
    label: 'Quedan pocas',
    dot: 'bg-warning',
    className: 'bg-amber-50 text-warning',
  },
  agotado: {
    label: 'Agotado',
    dot: 'bg-danger',
    className: 'bg-red-50 text-danger',
  },
}

export function StockBadge({
  status,
  size = 'sm',
}: {
  status: StockStatus
  size?: 'sm' | 'md'
}) {
  const c = config[status]
  const pad = size === 'md' ? 'px-2.5 py-1 text-xs' : 'px-2 py-0.5 text-[11px]'
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-bold ${pad} ${c.className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  )
}
