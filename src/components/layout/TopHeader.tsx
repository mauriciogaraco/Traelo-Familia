import { Link } from 'react-router-dom'
import { Logo } from '../ui/Logo'
import { CityPill } from '../city/CityPill'
import { useCatalog } from '../../context/CatalogContext'

/** Cabecera de las pestañas principales: logo, localidad activa y acceso a "Mis pedidos". */
export function TopHeader() {
  const { syncing } = useCatalog()
  return (
    <>
      <header className="bg-gradient-warm px-4 pt-4 pb-4 rounded-b-[1.75rem] border-b border-border/70">
        <div className="flex items-center gap-2">
          <Link to="/" aria-label="Inicio">
            <Logo />
          </Link>
          <div className="ml-auto flex items-center gap-2 min-w-0">
            <CityPill />
            <Link
              to="/pedidos"
              aria-label="Mis pedidos"
              className="w-10 h-10 rounded-full bg-surface/80 border border-border flex items-center justify-center text-text-primary flex-shrink-0 hover:border-primary/40"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 4h11l3 3v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h8M8 14h6" />
              </svg>
            </Link>
          </div>
        </div>
      </header>
      {syncing && (
        <div className="flex items-center gap-2 px-4 py-1.5 text-[11px] font-medium text-text-secondary bg-stone-100/80 border-b border-border/30">
          <div className="w-2.5 h-2.5 border border-primary border-t-transparent rounded-full animate-spin shrink-0" />
          Actualizando catálogo...
        </div>
      )}
    </>
  )
}
