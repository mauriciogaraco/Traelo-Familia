// @ts-check
/**
 * Genera public/data/catalog-familia.json a partir de los datos en CUP.
 * Conversión: CUP ÷ 500 = USD (redondeado a 2 decimales)
 */

import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

const RATE = 500

function toUsd(cup) {
  return Math.round(cup / RATE * 100) / 100
}

function mapCategory(cat) {
  const map = {
    Comida: 'Comidas',
    Bebidas: 'Bebidas',
    Alimentos: 'Comidas',
    Aseo: 'Regalos',
    Confituras: 'Regalos',
  }
  return map[cat] ?? 'Comidas'
}

function convertProduct(p, categoryOverride) {
  const prod = {
    ...p,
    price: toUsd(p.price),
    category: categoryOverride ?? mapCategory(p.category),
  }
  if (prod.addons) prod.addons = prod.addons.map(a => ({ ...a, price: toUsd(a.price) }))
  if (prod.packaging) prod.packaging = prod.packaging.map(pk => ({ ...pk, price: toUsd(pk.price) }))
  return prod
}

// ── Load source data ───────────────────────────────────────────────
const bodega  = JSON.parse(readFileSync(resolve(root, 'data/bodega-central.json'), 'utf8'))
const dlm     = JSON.parse(readFileSync(resolve(root, 'data/dlm.json'), 'utf8'))
const macus   = JSON.parse(readFileSync(resolve(root, 'data/panes-macus.json'), 'utf8'))
const marina  = JSON.parse(readFileSync(resolve(root, 'data/la-marina.json'), 'utf8'))

// ── Convert products ───────────────────────────────────────────────
const bodegaProducts = bodega.map(p => convertProduct(p))
const dlmProducts    = dlm.map(p => convertProduct(p))
const macusProducts  = macus.map(p =>
  convertProduct(p, p.category === 'Bebidas' ? 'Bebidas' : 'Panadería')
)
const marinaProducts = marina.map(p => convertProduct(p))

// ── Mercadito Ahorro → Combos (placeholder) ───────────────────────
const combos = [
  {
    id: 'combo-001',
    name: 'Combo Familiar Básico',
    businessId: 'mercadito-ahorro',
    businessName: 'El Mercadito',
    category: 'Combos',
    shortDescription: 'Para 4 personas.',
    longDescription: 'Arroz 5lb · Frijoles 2lb · Aceite 900ml · Pollo 1kg. Llena la mesa de tu familia.',
    image: '🎁',
    price: 25,
    stockStatus: 'disponible',
  },
  {
    id: 'combo-002',
    name: 'Combo Fiesta',
    businessId: 'mercadito-ahorro',
    businessName: 'El Mercadito',
    category: 'Combos',
    shortDescription: 'Para celebrar.',
    longDescription: 'Cerveza x6 · Refrescos x6 · Croquetas · Papas fritas · Pastelitos. Todo para una fiesta.',
    image: '🎉',
    price: 30,
    stockStatus: 'disponible',
  },
  {
    id: 'combo-003',
    name: 'Combo Mensual',
    businessId: 'mercadito-ahorro',
    businessName: 'El Mercadito',
    category: 'Combos',
    shortDescription: 'Despensa del mes.',
    longDescription: 'Arroz 10lb · Frijoles 5lb · Aceite x2 · Espaguetis x3 · Jabón de lavar · Papel sanitario.',
    image: '🛒',
    price: 45,
    stockStatus: 'disponible',
  },
  {
    id: 'combo-004',
    name: 'Combo Bebidas',
    businessId: 'mercadito-ahorro',
    businessName: 'El Mercadito',
    category: 'Combos',
    shortDescription: 'Refrescos y más.',
    longDescription: 'Cerveza x12 · Malta x6 · Refresco x12. Ideal para refrescar a toda la familia.',
    image: '🍺',
    price: 22,
    stockStatus: 'disponible',
  },
  {
    id: 'combo-005',
    name: 'Combo Niños',
    businessId: 'mercadito-ahorro',
    businessName: 'El Mercadito',
    category: 'Combos',
    shortDescription: 'Para los más pequeños.',
    longDescription: 'Yogurt Vima x4 · Jugos Petit x12 · Galletas x3 · Chupa chups · Gelatina x2.',
    image: '🧒',
    price: 20,
    stockStatus: 'disponible',
  },
  {
    id: 'combo-006',
    name: 'Combo Aseo',
    businessId: 'mercadito-ahorro',
    businessName: 'El Mercadito',
    category: 'Combos',
    shortDescription: 'Higiene del hogar.',
    longDescription: 'Papel sanitario · Jabón en polvo · Lavavajillas · Pasta dental · Toallitas húmedas.',
    image: '🧹',
    price: 28,
    stockStatus: 'disponible',
  },
]

// ── Línea Callejón (nuevo restaurante, placeholder) ───────────────
const lineaCallejonProducts = [
  {
    id: 'lc-001',
    name: 'Pizza de Queso',
    businessId: 'linea-callejon',
    businessName: 'Línea Callejón',
    category: 'Comidas',
    shortDescription: 'Clásica.',
    longDescription: 'Pizza de queso fundido recién horneada.',
    image: '🍕',
    price: 0.80,
    stockStatus: 'disponible',
  },
  {
    id: 'lc-002',
    name: 'Pizza de Jamón',
    businessId: 'linea-callejon',
    businessName: 'Línea Callejón',
    category: 'Comidas',
    shortDescription: 'Con jamón.',
    longDescription: 'Pizza de jamón y queso.',
    image: '🍕',
    price: 1.34,
    stockStatus: 'disponible',
  },
  {
    id: 'lc-003',
    name: 'Pizza Especial',
    businessId: 'linea-callejon',
    businessName: 'Línea Callejón',
    category: 'Comidas',
    shortDescription: 'La estrella de la casa.',
    longDescription: 'Pizza especial con ingredientes de la casa.',
    image: '🍕',
    price: 1.80,
    stockStatus: 'disponible',
  },
  {
    id: 'lc-004',
    name: 'Espaguetis',
    businessId: 'linea-callejon',
    businessName: 'Línea Callejón',
    category: 'Comidas',
    shortDescription: 'Con salsa de la casa.',
    longDescription: 'Espaguetis con salsa especial de la casa.',
    image: '🍝',
    price: 0.90,
    stockStatus: 'disponible',
  },
  {
    id: 'lc-005',
    name: 'Espaguetis Jamón y Queso',
    businessId: 'linea-callejon',
    businessName: 'Línea Callejón',
    category: 'Comidas',
    shortDescription: 'Con jamón y queso.',
    longDescription: 'Espaguetis con jamón y queso gratinados.',
    image: '🍝',
    price: 1.40,
    stockStatus: 'disponible',
  },
  {
    id: 'lc-dr-ref-naranja',
    name: 'Ref. Naranja',
    businessId: 'linea-callejon',
    businessName: 'Línea Callejón',
    category: 'Bebidas',
    shortDescription: '',
    longDescription: 'Se vende por unidad.',
    image: '🥤',
    price: 0.70,
    stockStatus: 'disponible',
  },
  {
    id: 'lc-dr-malta',
    name: 'Malta',
    businessId: 'linea-callejon',
    businessName: 'Línea Callejón',
    category: 'Bebidas',
    shortDescription: '',
    longDescription: 'Se vende por unidad.',
    image: '🍺',
    price: 0.90,
    stockStatus: 'disponible',
  },
  {
    id: 'lc-dr-agua',
    name: 'Agua Natural',
    businessId: 'linea-callejon',
    businessName: 'Línea Callejón',
    category: 'Bebidas',
    shortDescription: '',
    longDescription: 'Se vende por unidad.',
    image: '💧',
    price: 0.36,
    stockStatus: 'disponible',
  },
]

// ── Businesses ─────────────────────────────────────────────────────
const businesses = [
  {
    id: 'bodega-central',
    name: 'Mercado Alpha',
    description: 'Alimentos, bebidas y productos del día a día.',
    image: '/assets/images/business/alpha.jpg',
    color: 'from-amber-100 to-orange-50',
  },
  {
    id: 'dlm',
    name: 'Bar Restaurante DLM',
    description: 'Sabores de la casa, bebidas y platos fuertes para compartir.',
    image: '/assets/images/business/DLM.jpg',
    color: 'from-rose-100 to-orange-50',
  },
  {
    id: 'panes-macus',
    name: 'Los Macus',
    description: 'Panadería: panes recién hechos y bebidas frías.',
    image: '/assets/images/business/macus.jpg',
    color: 'from-yellow-100 to-amber-50',
  },
  {
    id: 'mercadito-ahorro',
    name: 'El Mercadito',
    description: 'Combos curados para enviar a tu familia.',
    image: '/assets/images/business/Mercadito.jpg',
    color: 'from-emerald-100 to-teal-50',
  },
  {
    id: 'la-marina',
    name: 'La Marina',
    description: 'Pizzas y espaguetis con agregos a elección, más bebidas frías.',
    image: '/assets/images/products/pizza.jpg',
    color: 'from-red-100 to-orange-50',
  },
  {
    id: 'linea-callejon',
    name: 'Línea Callejón',
    description: 'Pizzería restaurante con sabor de barrio.',
    image: '/assets/images/business/DLM.jpg',
    color: 'from-purple-100 to-pink-50',
  },
]

// ── Assemble catalog ───────────────────────────────────────────────
const catalog = {
  businesses,
  products: [
    ...bodegaProducts,
    ...dlmProducts,
    ...macusProducts,
    ...combos,
    ...marinaProducts,
    ...lineaCallejonProducts,
  ],
}

const outPath = resolve(root, 'public/data/catalog-familia.json')
writeFileSync(outPath, JSON.stringify(catalog, null, 2))
console.log(`✓ catalog-familia.json generado — ${catalog.products.length} productos, ${catalog.businesses.length} negocios`)
