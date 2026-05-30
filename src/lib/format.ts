/** Formatea un precio en CUP, ej: 1250 → "1 250 CUP". */
export function formatPrice(value: number): string {
  return `${value.toLocaleString('es-CU')} CUP`
}

/** Solo el número con separador de miles, sin la moneda. */
export function formatAmount(value: number): string {
  return value.toLocaleString('es-CU')
}

/** Fecha legible, ej: "30 may 2026, 14:05". */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-CU', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
