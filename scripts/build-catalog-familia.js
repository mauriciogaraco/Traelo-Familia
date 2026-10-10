// @ts-check
/**
 * Genera public/data/catalog-familia.json a partir del backend real de Tráelo
 * (api.traelo-market.com) — ya NO depende del catálogo estático legacy de Tráelo Normal
 * (data/*.json editado a mano → raw GitHub). Ese pipeline estaba desconectado de la base de
 * datos real: un precio cambiado desde el dashboard nunca llegaba a Tráelo Familia. Ahora todo
 * sale de la misma fuente que ya usa la app de Tráelo Normal.
 *
 * Precios: el backend da todo en CUP; se convierten a USD con la tasa en vivo de
 * GET /catalog/familia/config (Settings del dashboard, antes hardcodeada acá).
 *
 * Si no hay TRAELO_API_KEY configurada o el backend no responde, el script no toca el catálogo
 * ya commiteado (se mantiene el último bueno conocido) en vez de romper el build.
 */

import { writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

const API_BASE = process.env.TRAELO_API_BASE_URL || 'https://api.traelo-market.com/api/v1/catalog'
const API_KEY = process.env.TRAELO_API_KEY
const DEFAULT_RATE = 500

/** Convierte CUP → USD con la tasa dada (redondeado a 2 decimales). */
function cupToUsd(cup, rate) {
  return Math.round((cup / rate) * 100) / 100
}

async function apiGet(path) {
  const res = await fetch(`${API_BASE}${path}`, { headers: { 'x-api-key': API_KEY } })
  if (!res.ok) throw new Error(`HTTP ${res.status} en ${path}`)
  const body = await res.json()
  return body.data
}

/** Tasa de cambio editable en vivo desde Settings — si falla, sigue con DEFAULT_RATE. */
async function fetchExchangeRate() {
  try {
    return (await apiGet('/familia/config')).exchangeRate
  } catch (err) {
    console.warn(`⚠ No se pudo leer la tasa de cambio (${err.message}) — usando ${DEFAULT_RATE}`)
    return DEFAULT_RATE
  }
}

/** Productos marcados "disponible solo para Tráelo Familia" (Product.familiaOnly) en el dashboard. */
async function fetchFamiliaOnlyProducts() {
  try {
    return await apiGet('/familia/products')
  } catch (err) {
    console.warn(`⚠ No se pudieron leer los productos exclusivos de Familia (${err.message})`)
    return []
  }
}

// Categorías reales del backend (Product.category / Category.name) → las 5 categorías de
// Familia. Cualquier categoría no listada cae en 'Comidas' por defecto. A diferencia del
// catálogo legacy anterior, esta taxonomía viene de la base de datos real — se puede ver con
// GET /catalog/bootstrap si hace falta ajustar el mapeo.
const CATEGORY_MAP = {
  Bebidas: 'Bebidas',
  Ron: 'Bebidas',
  Restaurantes: 'Comidas',
  Mercado: 'Comidas',
  'Cárnicos': 'Comidas',
  'Comida Criolla': 'Comidas',
  Helados: 'Comidas',
  'Pizzas y Más': 'Comidas',
  Pizzas: 'Comidas',
  'Productos del Agro': 'Comidas',
  'Compra Mayorista': 'Comidas',
  'Compra mayorista': 'Comidas',
  Tamal: 'Comidas',
  'Ropa y Accesorios': 'Regalos',
  'Aseo y limpieza': 'Regalos',
  Dulces: 'Regalos',
  Confituras: 'Regalos',
  Confitura: 'Regalos',
  'Electrodomésticos': 'Regalos',
  'Ferretería': 'Regalos',
  Panes: 'Panadería',
}

function mapCategory(product) {
  const key = (product.categoryName || product.category || '').trim()
  return CATEGORY_MAP[key] ?? 'Comidas'
}

// Combos exclusivos de Familia que todavía no viven como productos reales en el dashboard
// (candidatos a migrar ahí con Product.familiaOnly más adelante — ver fetchFamiliaOnlyProducts).
// Los precios ya están en USD (no pasan por cupToUsd).
const COMBOS_BUSINESS_NAME = 'El Mercadito'
const COMBOS = [
  {
    id: 'combo-papa',
    name: 'Combo para Papá 👨',
    businessName: COMBOS_BUSINESS_NAME,
    category: 'Combos',
    shortDescription: '¡Especial Día del Padre!',
    longDescription:
      'Colonia Árabe de hombre · Caja de cerveza · Maquinitas de afeitar con repuestos · Lomo de cerdo entero limpio (~10 lbs) · Completa de jamón serrano y chorizo · Cubeta de mayonesa 3600 ml.',
    image: '👨',
    price: 80,
    stockStatus: 'disponible',
  },
  {
    id: 'combo-001',
    name: 'Combo Familiar Básico',
    businessName: COMBOS_BUSINESS_NAME,
    category: 'Combos',
    shortDescription: 'La despensa esencial.',
    longDescription:
      'Arroz 5 lbs · Frijoles 1 kg · Aceite 900 ml x2 · Azúcar 5 lbs · Paquete de pollo muslo · Paquete de café.',
    image: '🎁',
    price: 25,
    stockStatus: 'disponible',
  },
  {
    id: 'combo-super',
    name: 'Super Combo',
    businessName: COMBOS_BUSINESS_NAME,
    category: 'Combos',
    shortDescription: 'Lo mejor de lo mejor.',
    longDescription:
      'Pieza de jamón importado 5–6 lbs · Completa de jamón serrano y chorizo · Yogurt probiótico 1 lt · Mayonesa Benimar cubeta 3600 ml · Saco de arroz americano 50 lbs · Lomo de cerdo limpio entero 10 lbs · Caja de malta · Pollo 10 lbs.',
    image: '⭐',
    price: 150,
    stockStatus: 'disponible',
  },
  {
    id: 'combo-escolar',
    name: 'Combo Escolar',
    businessName: COMBOS_BUSINESS_NAME,
    category: 'Combos',
    shortDescription: 'Para los más pequeños.',
    longDescription:
      'Galletas de soda x7 · Pote de mantequilla · Refresco Cana 420 ml x12 · Refresco Lual x10 paquetes · Galletas María x10 · Galletas dulces x10 · Chupa chups x10 · Botonetas x10.',
    image: '🎒',
    price: 25,
    stockStatus: 'disponible',
  },
  {
    id: 'combo-cumple-adulto',
    name: 'Combo Cumpleaños Adulto',
    businessName: COMBOS_BUSINESS_NAME,
    category: 'Combos',
    shortDescription: '¡A celebrar lo grande!',
    longDescription:
      'Cake · Caja de cerveza · Botella de ron x2 · Pomo de refresco x2 · Completa de jamón serrano, chorizo y salsichón x2.',
    image: '🎂',
    price: 52,
    stockStatus: 'disponible',
  },
  {
    id: 'combo-cumple-nino',
    name: 'Combo Cumpleaños Niño',
    businessName: COMBOS_BUSINESS_NAME,
    category: 'Combos',
    shortDescription: '¡Que lo disfruten!',
    longDescription:
      'Cake · Refresco Cana 420 ml x12 · Caja de malta · Galletas María x10 · Galletas dulces x20 · Galletas de soda x14 · Botonetas x20 · Leche condensada x5.',
    image: '🎈',
    price: 65,
    stockStatus: 'disponible',
  },
]

// Ajustes de precio puntuales que no vienen del backend (decisiones de negocio propias de
// Familia) — resueltos por NOMBRE real del negocio, porque los ids de este backend son cuids,
// no los slugs del catálogo legacy anterior ("dlm", "mercadito-ahorro", "pizzeria-mm"...).
// Se reaplican en cada build.
function adjustPrice(p, businessNameById) {
  const bizName = businessNameById.get(p.businessId) ?? ''
  if (bizName === 'Bar Restaurante DLM' && p.name.trim().toLowerCase() === 'ensalada mixta') {
    return { ...p, price: 3 }
  }
  // Cerveza/refresco de lata: precio de mercado fijo, sin importar el negocio.
  if (/(cerveza|refresco).*\b(de|en)\s+lata\b/i.test(p.name)) {
    return { ...p, price: 1 }
  }
  if (bizName === COMBOS_BUSINESS_NAME) {
    const text = `${p.name} ${p.shortDescription ?? ''}`.toLowerCase()
    if (text.includes('aceite')) return { ...p, price: Math.round((p.price + 5) * 100) / 100 }
  }
  return p
}

// Placeholder mientras carga la foto (ver LazyImage) — no hay noción de "color de marca" en el
// backend real, así que se asigna un degradado fijo por negocio (determinístico, no aleatorio
// entre builds) de la misma paleta que ya usa ProductImage.
const PLACEHOLDER_GRADIENTS = [
  'from-orange-100 to-amber-50',
  'from-rose-100 to-orange-50',
  'from-pink-100 to-rose-50',
  'from-sky-100 to-cyan-50',
  'from-yellow-100 to-amber-50',
  'from-stone-100 to-stone-50',
]
function colorFor(id) {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0
  return PLACEHOLDER_GRADIENTS[hash % PLACEHOLDER_GRADIENTS.length]
}

// Copy propio de Familia que el backend no tiene (marketing, no dato de negocio) — se reaplica
// a mano por nombre real en cada build. Ver COMBOS arriba.
const BUSINESS_OVERRIDES = {
  [COMBOS_BUSINESS_NAME]: {
    description: 'Combos curados para enviar a tu familia, más productos del día a día.',
    paymentNote:
      '¿Quieres añadir o quitar algo? Todos los combos se pueden personalizar a tu gusto. Escríbenos por WhatsApp y armamos el tuyo.',
  },
}

function mapBusiness(b) {
  const override = BUSINESS_OVERRIDES[b.name]
  return {
    id: b.id,
    name: b.name,
    description: override?.description ?? '',
    image: b.logoUrl,
    color: colorFor(b.id),
    ...(override?.paymentNote ? { paymentNote: override.paymentNote } : {}),
    // acceptingOrders/isOpenNow ya los calcula el backend en vivo (horario real de La Habana) —
    // más preciso que el flag manual que usaba el catálogo legacy.
    ...(!b.acceptingOrders || !b.isOpenNow ? { status: 'cerrado' } : {}),
  }
}

function mapProduct(p, businessNameById, rate) {
  const priceCup = p.effectivePrice ?? p.price ?? 0
  return {
    id: p.id,
    businessId: p.businessId,
    businessName: businessNameById.get(p.businessId) ?? '',
    category: mapCategory(p),
    name: p.name,
    shortDescription: p.description ?? '',
    longDescription: p.description ?? '',
    image: '🛍️',
    ...(p.imageUrl ? { photo: p.imageUrl } : {}),
    price: cupToUsd(priceCup, rate),
    ...(p.formato ? { formato: p.formato } : {}),
    ...(p.options?.length ? { options: p.options } : {}),
    ...(p.addons?.length
      ? { addons: p.addons.map(a => ({ ...a, price: cupToUsd(a.price, rate) })) }
      : {}),
    ...(p.packaging?.length
      ? { packaging: p.packaging.map(pk => ({ ...pk, price: cupToUsd(pk.price, rate) })) }
      : {}),
    stockStatus: !p.available ? 'agotado' : p.lowStock ? 'pocas' : 'disponible',
  }
}

async function main() {
  if (!API_KEY) {
    console.warn('⚠ TRAELO_API_KEY no configurada — se mantiene el catálogo existente sin cambios.')
    return
  }

  const rate = await fetchExchangeRate()
  console.log(`✓ tasa de cambio Tráelo Familia: ${rate} CUP = 1 USD`)

  let bootstrap
  try {
    bootstrap = await apiGet('/bootstrap')
  } catch (err) {
    console.warn(
      `⚠ No se pudo descargar el catálogo del backend (${err.message}) — se mantiene el existente sin cambios.`
    )
    return
  }

  const businessNameById = new Map(bootstrap.businesses.map(b => [b.id, b.name]))
  const businesses = bootstrap.businesses.map(mapBusiness)
  const products = bootstrap.products.map(p => mapProduct(p, businessNameById, rate))

  const combosBusinessId = [...businessNameById.entries()].find(
    ([, name]) => name === COMBOS_BUSINESS_NAME
  )?.[0]
  if (!combosBusinessId) {
    console.warn(`⚠ No se encontró el negocio "${COMBOS_BUSINESS_NAME}" — se omiten los COMBOS`)
  }
  const combos = combosBusinessId ? COMBOS.map(c => ({ ...c, businessId: combosBusinessId })) : []

  const dashboardExclusive = (await fetchFamiliaOnlyProducts()).map(p =>
    mapProduct(p, businessNameById, rate)
  )
  if (dashboardExclusive.length > 0) {
    console.log(`✓ ${dashboardExclusive.length} producto(s) exclusivo(s) de Familia desde el dashboard`)
  }

  const catalog = {
    businesses,
    products: [...products, ...combos, ...dashboardExclusive].map(p =>
      adjustPrice(p, businessNameById)
    ),
  }

  const outPath = resolve(root, 'public/data/catalog-familia.json')
  writeFileSync(outPath, JSON.stringify(catalog, null, 2))
  console.log(
    `✓ catalog-familia.json — ${catalog.products.length} productos, ${catalog.businesses.length} negocios`
  )
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
