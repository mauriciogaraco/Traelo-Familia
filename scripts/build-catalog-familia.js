// @ts-check
/**
 * Descarga el catálogo de Tráelo Normal desde GitHub y genera
 * public/data/catalog-familia.json con precios convertidos a USD.
 *
 * Conversión: CUP ÷ 500 = USD (redondeado a 2 decimales)
 * Excepciones USD: negocio eme-boutique (currency:"USD") y
 *   productos ma-ecoflow-delta2 / ma-ecoflow-delta3 (currency:"USD")
 */

import { writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

const SOURCE_URL =
  'https://raw.githubusercontent.com/mauriciogaraco/Traelo/main/public/data/catalog-familia.json'

const RATE = 500

/** Convierte CUP → USD (solo para addons y packaging, cuyo precio llega en CUP). */
function cupToUsd(cup) {
  return Math.round((cup / RATE) * 100) / 100
}

const CAT_MAP = {
  Comida: 'Comidas',
  Bebidas: 'Bebidas',
  Alimentos: 'Comidas',
  Aseo: 'Regalos',
  Confituras: 'Regalos',
  Batidos: 'Bebidas',
  Malteadas: 'Bebidas',
  Ropa: 'Regalos',
  Dulcería: 'Panadería',
  Postres: 'Comidas',
  Cakes: 'Panadería',
  Panes: 'Panadería',
  Electrónica: 'Regalos',
}

function mapCat(cat, bizId) {
  if (bizId === 'panes-macus') return cat === 'Bebidas' ? 'Bebidas' : 'Panadería'
  return CAT_MAP[cat] ?? 'Comidas'
}

/**
 * Ajustes de precio propios de Familia (no vienen del catálogo fuente,
 * hay que reaplicarlos en cada sync).
 */
function adjustPrice(p) {
  if (p.businessId === 'dlm' && p.name.trim().toLowerCase() === 'ensalada mixta') {
    return { ...p, price: 3 }
  }
  const text = `${p.name} ${p.shortDescription ?? ''} ${p.longDescription ?? ''}`.toLowerCase()
  if (p.businessId === 'mercadito-ahorro' && text.includes('aceite')) {
    return { ...p, price: Math.round((p.price + 5) * 100) / 100 }
  }
  return p
}

// Combos exclusivos de Familia (ya en USD)
const COMBOS = [
  {
    id: 'combo-papa',
    name: 'Combo para Papá 👨',
    businessId: 'mercadito-ahorro',
    businessName: 'El Mercadito',
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
    businessId: 'mercadito-ahorro',
    businessName: 'El Mercadito',
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
    businessId: 'mercadito-ahorro',
    businessName: 'El Mercadito',
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
    businessId: 'mercadito-ahorro',
    businessName: 'El Mercadito',
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
    businessId: 'mercadito-ahorro',
    businessName: 'El Mercadito',
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
    businessId: 'mercadito-ahorro',
    businessName: 'El Mercadito',
    category: 'Combos',
    shortDescription: '¡Que lo disfruten!',
    longDescription:
      'Cake · Refresco Cana 420 ml x12 · Caja de malta · Galletas María x10 · Galletas dulces x20 · Galletas de soda x14 · Botonetas x20 · Leche condensada x5.',
    image: '🎈',
    price: 65,
    stockStatus: 'disponible',
  },
]

async function main() {
  console.log('↓ Descargando catálogo de Tráelo Normal…')
  const res = await fetch(SOURCE_URL)
  if (!res.ok) throw new Error(`HTTP ${res.status} al descargar ${SOURCE_URL}`)
  const normal = await res.json()

  // Transformar negocios
  const businesses = normal.businesses.map(b => {
    const biz = { ...b }
    if (b.id === 'linea-callejon') {
      biz.name = 'Línea Callejón'
      biz.image = '/assets/images/business/Linea_Callejon.jpg'
    }
    if (b.id === 'mercadito-ahorro') {
      biz.description =
        'Combos curados para enviar a tu familia, más productos del día a día.'
      biz.paymentNote =
        '¿Quieres añadir o quitar algo? Todos los combos se pueden personalizar a tu gusto. Escríbenos por WhatsApp y armamos el tuyo.'
    }
    return biz
  })

  // Transformar productos
  // El precio principal ya viene en USD desde el catálogo fuente.
  // Addons y packaging siguen en CUP → se convierten aquí.
  const products = normal.products.map(p => {
    const prod = {
      ...p,
      category: mapCat(p.category, p.businessId),
    }
    if (p.businessId === 'linea-callejon') {
      prod.businessName = 'Línea Callejón'
    }
    if (prod.addons) {
      prod.addons = prod.addons.map(a => ({ ...a, price: cupToUsd(a.price) }))
    }
    if (prod.packaging) {
      prod.packaging = prod.packaging.map(pk => ({ ...pk, price: cupToUsd(pk.price) }))
    }
    return prod
  })

  const catalog = {
    businesses,
    products: [...products, ...COMBOS].map(adjustPrice),
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
