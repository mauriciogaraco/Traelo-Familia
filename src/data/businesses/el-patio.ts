import type { Business, Category, Product, StockStatus } from '../../types'
import DLM from '../../assets/images/business/DLM.jpg'
import menuData from './products.json'

const ID = 'dlm'
const NAME = 'Bar Restaurante DLM'

export const dlm: Business = {
  id: ID,
  name: NAME,
  description: 'Sabores de la casa, bebidas, picaderas y platos fuertes para compartir.',
  image: DLM,
  color: 'from-rose-100 to-orange-50',
  schedule: { days: [3, 4, 5, 6, 0], open: '09:00', close: '22:00', label: 'Mié–Dom · 9:00 am – 10:00 pm' },
}

// ── Mapeo del JSON de la carta al formato de la app ──

interface MenuJson {
  restaurant: { name: string; subtitle?: string; description?: string; service?: string }
  categories: {
    title: string
    subtitle?: string
    products: { name: string; price: string; available: boolean }[]
  }[]
}

const menu = menuData as MenuJson

/** Secciones que NO se incluyen: cócteles, agregos, líneas (espirituosos) y café. */
const EXCLUDED = new Set(['Coctelería', 'Agregos', 'Líneas', 'Café'])

/** Secciones de bebida (el resto se considera Comida). */
const DRINK_SECTIONS = new Set(['Bebidas', 'Café', 'Líneas', 'Botellas en Ofertas'])

/** Emoji por sección (no hay fotos en el JSON). */
const SECTION_EMOJI: Record<string, string> = {
  Entrantes: '🍤',
  Fríos: '🥗',
  Cocteles: '🦐',
  Guarniciones: '🍚',
  Agregos: '➕',
  'Pastas & arroz': '🍝',
  Pollo: '🍗',
  Cerdo: '🥩',
  Res: '🥩',
  Mar: '🦞',
  Postres: '🍮',
  Bebidas: '🥤',
  Café: '☕',
  Líneas: '🥃',
  'Botellas en Ofertas': '🍾',
}

/** "$1350" → 1350, "$120 USD" → 120, "Con agregos" → null. */
function parsePrice(raw: string): number | null {
  const digits = raw.replace(/[^\d]/g, '')
  return digits ? parseInt(digits, 10) : null
}

function buildProducts(): Product[] {
  const out: Product[] = []
  let n = 0
  for (const cat of menu.categories) {
    if (EXCLUDED.has(cat.title)) continue
    const category: Category = DRINK_SECTIONS.has(cat.title) ? 'Bebidas' : 'Comida'
    const image = SECTION_EMOJI[cat.title] ?? '🍽️'
    for (const p of cat.products) {
      const price = parsePrice(p.price)
      if (price === null) continue // ignora precios no numéricos (ej: "Con agregos")
      n += 1
      const status: StockStatus = p.available ? 'disponible' : 'agotado'
      out.push({
        id: `dlm-${String(n).padStart(3, '0')}`,
        name: p.name.trim(),
        businessId: ID,
        businessName: NAME,
        category,
        shortDescription: cat.title,
        longDescription: cat.subtitle ? `${cat.title} · ${cat.subtitle}` : cat.title,
        image,
        price,
        stockStatus: status,
      })
    }
  }
  return out
}

export const dlmProducts: Product[] = buildProducts()
