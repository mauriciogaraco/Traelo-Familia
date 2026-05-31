import logoUrl from '../../assets/logo.webp'

interface LogoProps {
  /** Tamaño de la marca (icono). */
  size?: 'sm' | 'md' | 'lg'
  /** Mostrar el texto "Tráelo" junto a la marca. */
  showWordmark?: boolean
  /** Usar un cohete como acento sobre la "a" (en lugar de la tilde). */
  rocketAccent?: boolean
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

function RocketAccent() {
  return (
    <span
      className="absolute left-1/2 -translate-x-1/2 -top-[0.34em] w-[0.5em] h-[0.5em] -rotate-[12deg] text-primary"
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
        <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
        <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
        <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
      </svg>
    </span>
  )
}

export function Logo({
  size = 'md',
  showWordmark = true,
  rocketAccent = true,
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
          {rocketAccent ? (
            <>
              Tr
              <span className="relative inline-block">
                a
                <RocketAccent />
              </span>
              elo
            </>
          ) : (
            'Tráelo'
          )}
        </span>
      )}
    </span>
  )
}
