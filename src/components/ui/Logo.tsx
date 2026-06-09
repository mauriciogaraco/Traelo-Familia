import logoUrl from '../../assets/logo.webp'

interface LogoProps {
  /** Tamaño de la marca (icono). */
  size?: 'sm' | 'md' | 'lg'
  /** Mostrar el texto "Tráelo" junto a la marca. */
  showWordmark?: boolean
  /** Mostrar el avión de papel "volando" alrededor de la "o". */
  plane?: boolean
  className?: string
}

const markSize = {
  sm: 'w-8 h-8 rounded-xl',
  md: 'w-10 h-10 rounded-[14px]',
  lg: 'w-16 h-16 rounded-3xl',
}
const wordSize = {
  sm: 'text-2xl',
  md: 'text-[1.7rem]',
  lg: 'text-5xl',
}

/**
 * Avión de papel (outline) con una pequeña estela de puntos, posicionado arriba
 * a la derecha de la "o" para que parezca que vuela a su alrededor.
 */
function PlaneAroundO() {
  return (
    <span
      className="absolute left-1/2 -top-[0.62em] flex items-center gap-[0.05em] text-primary"
      style={{ transform: 'translateX(-6%) rotate(-18deg)' }}
      aria-hidden="true"
    >
      {/* estela / puntos suspensivos */}
      <span className="w-[0.07em] h-[0.07em] rounded-full bg-current opacity-40" />
      <span className="w-[0.1em] h-[0.1em] rounded-full bg-current opacity-70" />
      {/* avión de papel outline */}
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-[0.52em] h-[0.52em] ml-[0.04em]"
      >
        <path d="m22 2-7 20-4-9-9-4Z" />
        <path d="M22 2 11 13" />
      </svg>
    </span>
  )
}

export function Logo({
  size = 'md',
  showWordmark = true,
  plane = true,
  className = '',
}: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-2 select-none ${className}`}>
      <img
        src={logoUrl}
        alt="Tráelo"
        width={40}
        height={40}
        className={`${markSize[size]} object-cover shadow-btn-primary`}
        loading="eager"
        decoding="async"
      />
      {showWordmark && (
        <span className={`font-brand text-primary leading-none pb-1 ${wordSize[size]}`}>
          {plane ? (
            <>
              Tráel
              <span className="relative inline-block">
                o
                <PlaneAroundO />
              </span>
            </>
          ) : (
            'Tráelo'
          )}
        </span>
      )}
    </span>
  )
}
