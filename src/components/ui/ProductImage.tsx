import type { Category } from '../../types'

const categoryGradient: Record<Category, string> = {
  Alimentos: 'from-amber-100 to-orange-50',
  Bebidas: 'from-sky-100 to-cyan-50',
  Aseo: 'from-violet-100 to-fuchsia-50',
  Hogar: 'from-emerald-100 to-green-50',
  Electrodomésticos: 'from-slate-200 to-slate-50',
  Comida: 'from-rose-100 to-orange-50',
}

interface ProductImageProps {
  emoji: string
  category: Category
  alt: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const emojiSize = { sm: 'text-3xl', md: 'text-5xl', lg: 'text-8xl' }

export function ProductImage({
  emoji,
  category,
  alt,
  size = 'md',
  className = '',
}: ProductImageProps) {
  const gradient = categoryGradient[category] ?? 'from-stone-100 to-stone-50'
  return (
    <div
      className={`relative flex items-center justify-center bg-gradient-to-br ${gradient} overflow-hidden ${className}`}
      role="img"
      aria-label={alt}
    >
      <span
        className="absolute -top-5 -right-5 w-20 h-20 rounded-full bg-white/40 blur-2xl"
        aria-hidden="true"
      />
      <span className={`relative ${emojiSize[size]} drop-shadow-sm`} aria-hidden="true">
        {emoji}
      </span>
    </div>
  )
}
