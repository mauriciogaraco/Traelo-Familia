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

/**
 * Sobrescribe el campo `photo` del catálogo fuente (que apunta a rutas
 * con tildes/espacios, ej. "/products/FerreGüira/Alicate -2600cup.jpg")
 * por rutas seguras basadas en el id del producto. Los archivos viven en
 * public/assets/images/products/<businessId>/<productId>.<ext> — nombres
 * con caracteres especiales dan 404 en algunos hosts (ver Linea_Callejón).
 */
const IMAGE_OVERRIDES = {
  "am-001": "/assets/images/products/amore/am-001.jpg",
  "am-002": "/assets/images/products/amore/am-002.jpg",
  "am-003": "/assets/images/products/amore/am-003.jpg",
  "am-004": "/assets/images/products/amore/am-004.jpg",
  "am-005": "/assets/images/products/amore/am-005.jpg",
  "am-006": "/assets/images/products/amore/am-006.jpg",
  "am-007": "/assets/images/products/amore/am-007.jpg",
  "am-008": "/assets/images/products/amore/am-008.jpg",
  "am-009": "/assets/images/products/amore/am-009.jpg",
  "am-010": "/assets/images/products/amore/am-010.jpg",
  "am-011": "/assets/images/products/amore/am-011.jpg",
  "am-012": "/assets/images/products/amore/am-012.jpg",
  "am-013": "/assets/images/products/amore/am-013.jpg",
  "am-014": "/assets/images/products/amore/am-014.jpg",
  "cr-001": "/assets/images/products/cronos/cr-001.jpg",
  "cr-002": "/assets/images/products/cronos/cr-002.jpg",
  "cr-003": "/assets/images/products/cronos/cr-003.jpg",
  "cr-004": "/assets/images/products/cronos/cr-004.jpg",
  "cr-005": "/assets/images/products/cronos/cr-005.jpg",
  "cr-006": "/assets/images/products/cronos/cr-006.jpg",
  "cr-007": "/assets/images/products/cronos/cr-007.jpg",
  "cr-008": "/assets/images/products/cronos/cr-008.jpg",
  "cr-009": "/assets/images/products/cronos/cr-009.jpg",
  "cr-010": "/assets/images/products/cronos/cr-010.jpg",
  "cr-011": "/assets/images/products/cronos/cr-011.jpg",
  "cr-012": "/assets/images/products/cronos/cr-012.jpg",
  "dulceM-001": "/assets/images/products/dulce-momento/dulceM-001.jpg",
  "dulceM-002": "/assets/images/products/dulce-momento/dulceM-002.jpg",
  "dulceM-003": "/assets/images/products/dulce-momento/dulceM-003.jpg",
  "dulceM-004": "/assets/images/products/dulce-momento/dulceM-004.jpg",
  "dulceM-005": "/assets/images/products/dulce-momento/dulceM-005.jpg",
  "dulceM-006": "/assets/images/products/dulce-momento/dulceM-006.jpg",
  "dulceM-007": "/assets/images/products/dulce-momento/dulceM-007.jpg",
  "dulceM-008": "/assets/images/products/dulce-momento/dulceM-008.jpg",
  "dulceM-009": "/assets/images/products/dulce-momento/dulceM-009.jpg",
  "dulceM-010": "/assets/images/products/dulce-momento/dulceM-010.jpg",
  "eb-001": "/assets/images/products/eme-boutique/eb-001.jpg",
  "eb-002": "/assets/images/products/eme-boutique/eb-002.jpg",
  "eb-003": "/assets/images/products/eme-boutique/eb-003.jpg",
  "eb-004": "/assets/images/products/eme-boutique/eb-004.jpg",
  "eb-005": "/assets/images/products/eme-boutique/eb-005.jpg",
  "eb-007": "/assets/images/products/eme-boutique/eb-007.jpg",
  "eb-009": "/assets/images/products/eme-boutique/eb-009.jpg",
  "eb-010": "/assets/images/products/eme-boutique/eb-010.jpg",
  "eb-011": "/assets/images/products/eme-boutique/eb-011.jpg",
  "eb-012": "/assets/images/products/eme-boutique/eb-012.jpg",
  "eb-013": "/assets/images/products/eme-boutique/eb-013.jpg",
  "eb-014": "/assets/images/products/eme-boutique/eb-014.jpg",
  "eb-015": "/assets/images/products/eme-boutique/eb-015.jpg",
  "eb-017": "/assets/images/products/eme-boutique/eb-017.jpg",
  "eb-021": "/assets/images/products/eme-boutique/eb-021.jpg",
  "eb-022": "/assets/images/products/eme-boutique/eb-022.jpg",
  "eb-023": "/assets/images/products/eme-boutique/eb-023.jpg",
  "eb-024": "/assets/images/products/eme-boutique/eb-024.jpg",
  "eb-025": "/assets/images/products/eme-boutique/eb-025.jpg",
  "eb-026": "/assets/images/products/eme-boutique/eb-026.jpg",
  "eb-028": "/assets/images/products/eme-boutique/eb-028.jpg",
  "eb-029": "/assets/images/products/eme-boutique/eb-029.jpg",
  "eb-030": "/assets/images/products/eme-boutique/eb-030.jpg",
  "eb-031": "/assets/images/products/eme-boutique/eb-031.jpg",
  "eb-032": "/assets/images/products/eme-boutique/eb-032.jpg",
  "eb-033": "/assets/images/products/eme-boutique/eb-033.jpg",
  "eb-035": "/assets/images/products/eme-boutique/eb-035.jpg",
  "eb-036": "/assets/images/products/eme-boutique/eb-036.jpg",
  "eb-037": "/assets/images/products/eme-boutique/eb-037.jpg",
  "eb-038": "/assets/images/products/eme-boutique/eb-038.jpg",
  "eb-040": "/assets/images/products/eme-boutique/eb-040.jpg",
  "eb-042": "/assets/images/products/eme-boutique/eb-042.jpg",
  "eb-043": "/assets/images/products/eme-boutique/eb-043.jpg",
  "eb-045": "/assets/images/products/eme-boutique/eb-045.jpg",
  "eb-046": "/assets/images/products/eme-boutique/eb-046.jpg",
  "eb-047": "/assets/images/products/eme-boutique/eb-047.jpg",
  "eb-049": "/assets/images/products/eme-boutique/eb-049.jpg",
  "eb-050": "/assets/images/products/eme-boutique/eb-050.jpg",
  "eb-051": "/assets/images/products/eme-boutique/eb-051.jpg",
  "eb-053": "/assets/images/products/eme-boutique/eb-053.jpg",
  "eb-054": "/assets/images/products/eme-boutique/eb-054.jpg",
  "eb-055": "/assets/images/products/eme-boutique/eb-055.jpg",
  "eb-056": "/assets/images/products/eme-boutique/eb-056.jpg",
  "eb-057": "/assets/images/products/eme-boutique/eb-057.jpg",
  "eb-058": "/assets/images/products/eme-boutique/eb-058.jpg",
  "eb-059": "/assets/images/products/eme-boutique/eb-059.jpg",
  "eb-060": "/assets/images/products/eme-boutique/eb-060.jpg",
  "eb-061": "/assets/images/products/eme-boutique/eb-061.jpg",
  "eb-062": "/assets/images/products/eme-boutique/eb-062.jpg",
  "eb-063": "/assets/images/products/eme-boutique/eb-063.jpg",
  "eb-064": "/assets/images/products/eme-boutique/eb-064.jpg",
  "eb-065": "/assets/images/products/eme-boutique/eb-065.jpg",
  "eb-066": "/assets/images/products/eme-boutique/eb-066.jpg",
  "eb-067": "/assets/images/products/eme-boutique/eb-067.jpg",
  "eb-068": "/assets/images/products/eme-boutique/eb-068.jpg",
  "eb-070": "/assets/images/products/eme-boutique/eb-070.jpg",
  "eb-071": "/assets/images/products/eme-boutique/eb-071.jpg",
  "eb-073": "/assets/images/products/eme-boutique/eb-073.jpg",
  "eb-074": "/assets/images/products/eme-boutique/eb-074.jpg",
  "eb-079": "/assets/images/products/eme-boutique/eb-079.jpg",
  "eb-080": "/assets/images/products/eme-boutique/eb-080.jpg",
  "eb-081": "/assets/images/products/eme-boutique/eb-081.jpg",
  "eb-083": "/assets/images/products/eme-boutique/eb-083.jpg",
  "fg-001": "/assets/images/products/ferreguira/fg-001.jpg",
  "fg-002": "/assets/images/products/ferreguira/fg-002.jpg",
  "fg-003": "/assets/images/products/ferreguira/fg-003.jpg",
  "fg-004": "/assets/images/products/ferreguira/fg-004.jpg",
  "fg-005": "/assets/images/products/ferreguira/fg-005.jpg",
  "fg-006": "/assets/images/products/ferreguira/fg-006.jpg",
  "fg-007": "/assets/images/products/ferreguira/fg-007.jpg",
  "fg-008": "/assets/images/products/ferreguira/fg-008.jpg",
  "fg-009": "/assets/images/products/ferreguira/fg-009.jpg",
  "fg-010": "/assets/images/products/ferreguira/fg-010.jpg",
  "fg-011": "/assets/images/products/ferreguira/fg-011.jpg",
  "fg-012": "/assets/images/products/ferreguira/fg-012.jpg",
  "fg-013": "/assets/images/products/ferreguira/fg-013.jpg",
  "fg-014": "/assets/images/products/ferreguira/fg-014.jpg",
  "fg-015": "/assets/images/products/ferreguira/fg-015.jpg",
  "fg-016": "/assets/images/products/ferreguira/fg-016.jpg",
  "fg-017": "/assets/images/products/ferreguira/fg-017.jpg",
  "fg-018": "/assets/images/products/ferreguira/fg-018.jpg",
  "fg-019": "/assets/images/products/ferreguira/fg-019.jpg",
  "fg-020": "/assets/images/products/ferreguira/fg-020.jpg",
  "fg-021": "/assets/images/products/ferreguira/fg-021.jpg",
  "fg-022": "/assets/images/products/ferreguira/fg-022.jpg",
  "fg-023": "/assets/images/products/ferreguira/fg-023.jpg",
  "fg-024": "/assets/images/products/ferreguira/fg-024.jpg",
  "fg-025": "/assets/images/products/ferreguira/fg-025.jpg",
  "fg-026": "/assets/images/products/ferreguira/fg-026.jpg",
  "fg-027": "/assets/images/products/ferreguira/fg-027.jpg",
  "fg-028": "/assets/images/products/ferreguira/fg-028.jpg",
  "fg-029": "/assets/images/products/ferreguira/fg-029.jpg",
  "fg-030": "/assets/images/products/ferreguira/fg-030.jpg",
  "fg-031": "/assets/images/products/ferreguira/fg-031.jpg",
  "fg-032": "/assets/images/products/ferreguira/fg-032.jpg",
  "fg-033": "/assets/images/products/ferreguira/fg-033.jpg",
  "fg-034": "/assets/images/products/ferreguira/fg-034.jpg",
  "fg-035": "/assets/images/products/ferreguira/fg-035.jpg",
  "fg-036": "/assets/images/products/ferreguira/fg-036.jpg",
  "fg-037": "/assets/images/products/ferreguira/fg-037.jpg",
  "fg-038": "/assets/images/products/ferreguira/fg-038.jpg",
  "fg-039": "/assets/images/products/ferreguira/fg-039.jpg",
  "fg-040": "/assets/images/products/ferreguira/fg-040.jpg",
  "fg-041": "/assets/images/products/ferreguira/fg-041.jpg",
  "fg-042": "/assets/images/products/ferreguira/fg-042.jpg",
  "frappio-001": "/assets/images/products/frappio/frappio-001.jpg",
  "frappio-002": "/assets/images/products/frappio/frappio-002.jpg",
  "frappio-003": "/assets/images/products/frappio/frappio-003.jpg",
  "frappio-004": "/assets/images/products/frappio/frappio-004.jpg",
  "frappio-005": "/assets/images/products/frappio/frappio-005.jpg",
  "frappio-006": "/assets/images/products/frappio/frappio-006.jpg",
  "hmk-001": "/assets/images/products/heladeria-mk/hmk-001.jpg",
  "hmk-002": "/assets/images/products/heladeria-mk/hmk-002.webp",
  "hmk-003": "/assets/images/products/heladeria-mk/hmk-003.jpg",
  "hmk-004": "/assets/images/products/heladeria-mk/hmk-004.jpg",
  "hmk-005": "/assets/images/products/heladeria-mk/hmk-005.jpg",
  "hmk-006": "/assets/images/products/heladeria-mk/hmk-006.jpg",
  "hmk-007": "/assets/images/products/heladeria-mk/hmk-007.jpg",
  "hmk-008": "/assets/images/products/heladeria-mk/hmk-008.jpg",
  "hmk-009": "/assets/images/products/heladeria-mk/hmk-009.jpg",
  "hmk-010": "/assets/images/products/heladeria-mk/hmk-010.jpg",
  "hmk-011": "/assets/images/products/heladeria-mk/hmk-011.jpg",
  "hmk-012": "/assets/images/products/heladeria-mk/hmk-012.jpg",
  "hmk-013": "/assets/images/products/heladeria-mk/hmk-013.jpg",
  "ln-001": "/assets/images/products/la-nevada/ln-001.jpg",
  "ln-002": "/assets/images/products/la-nevada/ln-002.jpg",
  "ln-003": "/assets/images/products/la-nevada/ln-003.jpg",
  "ln-004": "/assets/images/products/la-nevada/ln-004.jpg",
  "ln-005": "/assets/images/products/la-nevada/ln-005.jpg",
  "ln-006": "/assets/images/products/la-nevada/ln-006.jpg",
  "ln-007": "/assets/images/products/la-nevada/ln-007.jpg",
  "ln-008": "/assets/images/products/la-nevada/ln-008.jpg",
  "ln-009": "/assets/images/products/la-nevada/ln-009.jpg",
  "ln-010": "/assets/images/products/la-nevada/ln-010.jpg",
  "ln-011": "/assets/images/products/la-nevada/ln-011.jpg",
  "ln-012": "/assets/images/products/la-nevada/ln-012.jpg",
  "ln-013": "/assets/images/products/la-nevada/ln-013.jpg",
  "ln-014": "/assets/images/products/la-nevada/ln-014.jpg",
  "ln-016": "/assets/images/products/la-nevada/ln-016.jpg",
  "ln-017": "/assets/images/products/la-nevada/ln-017.jpg",
  "ln-018": "/assets/images/products/la-nevada/ln-018.jpg",
  "ln-019": "/assets/images/products/la-nevada/ln-019.jpg",
  "ln-020": "/assets/images/products/la-nevada/ln-020.jpg",
  "los-4-hermanos-001": "/assets/images/products/los-4-hermanos/los-4-hermanos-001.jpg",
  "lllk-001": "/assets/images/products/los-llenik/lllk-001.jpg",
  "lllk-002": "/assets/images/products/los-llenik/lllk-002.jpg",
  "lllk-003": "/assets/images/products/los-llenik/lllk-003.jpg",
  "lllk-004": "/assets/images/products/los-llenik/lllk-004.jpg",
  "lllk-005": "/assets/images/products/los-llenik/lllk-005.webp",
  "lllk-006": "/assets/images/products/los-llenik/lllk-006.jpg",
  "alp-001": "/assets/images/products/agro-los-prietos/alp-001.jpg",
  "alp-002": "/assets/images/products/agro-los-prietos/alp-002.webp",
  "alp-003": "/assets/images/products/agro-los-prietos/alp-003.jpg",
  "alp-004": "/assets/images/products/agro-los-prietos/alp-004.jpg",
  "alp-005": "/assets/images/products/agro-los-prietos/alp-005.jpg",
  "alp-006": "/assets/images/products/agro-los-prietos/alp-006.jpg",
  "alp-007": "/assets/images/products/agro-los-prietos/alp-007.webp",
  "alp-008": "/assets/images/products/agro-los-prietos/alp-008.jpg",
  "alp-009": "/assets/images/products/agro-los-prietos/alp-009.jpg",
  "alp-010": "/assets/images/products/agro-los-prietos/alp-010.webp",
  "alp-011": "/assets/images/products/agro-los-prietos/alp-011.jpg",
  "alp-012": "/assets/images/products/agro-los-prietos/alp-012.webp",
  "alp-013": "/assets/images/products/agro-los-prietos/alp-013.webp",
  "alp-014": "/assets/images/products/agro-los-prietos/alp-014.jpg",
  "alp-015": "/assets/images/products/agro-los-prietos/alp-015.jpg",
  "alp-016": "/assets/images/products/agro-los-prietos/alp-016.jpg",
  "alp-017": "/assets/images/products/agro-los-prietos/alp-017.jpg",
  "alp-018": "/assets/images/products/agro-los-prietos/alp-018.jpg",
  "alp-019": "/assets/images/products/agro-los-prietos/alp-019.jpg",
  "alp-020": "/assets/images/products/agro-los-prietos/alp-020.webp",
  "alp-021": "/assets/images/products/agro-los-prietos/alp-021.jpg",
  "alp-022": "/assets/images/products/agro-los-prietos/alp-022.jpg",
  "ac-007": "/assets/images/products/al-carbon/ac-007.jpg"
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
    if (IMAGE_OVERRIDES[prod.id]) {
      prod.photo = IMAGE_OVERRIDES[prod.id]
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
