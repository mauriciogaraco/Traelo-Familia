import { Link } from 'react-router-dom'

/** Falso buscador del Home: al tocarlo abre Buscar con el teclado listo. */
export function SearchLink({ placeholder = '¿Qué estás buscando hoy?' }: { placeholder?: string }) {
  return (
    <Link
      to="/buscar"
      className="relative flex items-center h-14 pl-12 pr-4 rounded-2xl bg-surface border border-border text-[15px] text-text-secondary shadow-soft"
      aria-label="Buscar negocios y productos"
    >
      <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2" />
      {placeholder}
    </Link>
  )
}

export function SearchIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={`text-text-secondary ${className}`} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
      <circle cx="11" cy="11" r="7" />
      <path strokeLinecap="round" d="m21 21-4.3-4.3" />
    </svg>
  )
}
