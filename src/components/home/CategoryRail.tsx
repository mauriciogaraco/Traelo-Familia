import type { Category } from '../../types'
import { categories, categoryEmoji } from '../../data/catalog'

interface CategoryRailProps {
  selected: Category | 'Todos'
  onSelect: (category: Category | 'Todos') => void
}

export function CategoryRail({ selected, onSelect }: CategoryRailProps) {
  const all: (Category | 'Todos')[] = ['Todos', ...categories]

  return (
    <div className="flex gap-2.5 overflow-x-auto scrollbar-none -mx-4 px-4 pb-1">
      {all.map((cat) => {
        const active = selected === cat
        const emoji = cat === 'Todos' ? '🛍️' : categoryEmoji[cat]
        return (
          <button
            key={cat}
            onClick={() => onSelect(cat)}
            className="flex flex-col items-center gap-1.5 w-[62px] flex-shrink-0 active:scale-95 transition-transform"
            aria-pressed={active}
          >
            <span
              className={`w-[54px] h-[54px] rounded-2xl flex items-center justify-center text-2xl transition-all ${
                active
                  ? 'bg-gradient-primary text-white shadow-btn-primary ring-2 ring-primary/20'
                  : 'bg-surface border border-border'
              }`}
            >
              <span aria-hidden="true">{emoji}</span>
            </span>
            <span
              className={`text-[10.5px] leading-tight text-center line-clamp-2 h-[26px] flex items-center ${
                active ? 'text-primary font-bold' : 'text-text-secondary font-semibold'
              }`}
            >
              {cat}
            </span>
          </button>
        )
      })}
    </div>
  )
}
