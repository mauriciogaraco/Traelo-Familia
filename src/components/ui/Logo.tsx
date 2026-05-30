interface LogoProps {
  /** Tamaño de la marca (cuadro con icono). */
  size?: 'sm' | 'md' | 'lg'
  /** Mostrar el texto "Tráelo" junto a la marca. */
  showWordmark?: boolean
  className?: string
}

const markSize = {
  sm: 'w-8 h-8 rounded-xl',
  md: 'w-9 h-9 rounded-[14px]',
  lg: 'w-16 h-16 rounded-3xl',
}
const iconSize = { sm: 18, md: 20, lg: 34 }
const wordSize = { sm: 'text-lg', md: 'text-xl', lg: 'text-3xl' }

export function Logo({ size = 'md', showWordmark = true, className = '' }: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-2 select-none ${className}`}>
      <span
        className={`relative ${markSize[size]} bg-gradient-primary shadow-btn-primary flex items-center justify-center overflow-hidden`}
      >
        {/* brillo suave */}
        <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white/30 blur-md" aria-hidden="true" />
        {/* bolsa de compra */}
        <svg
          width={iconSize[size]}
          height={iconSize[size]}
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth={2}
          className="relative"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5.5 8h13l-.9 11.2a2 2 0 0 1-2 1.8H8.4a2 2 0 0 1-2-1.8L5.5 8Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 8V6.5a3 3 0 0 1 6 0V8" />
        </svg>
      </span>
      {showWordmark && (
        <span
          className={`font-bold tracking-tight text-text-primary leading-none ${wordSize[size]}`}
        >
          Tráelo
        </span>
      )}
    </span>
  )
}
