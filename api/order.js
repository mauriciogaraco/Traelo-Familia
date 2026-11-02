// Función serverless de Vercel: recibe el pedido, lo valida contra el catálogo, lo GUARDA en la base de datos
// de Tráelo (backend, pestaña "Familia" del dashboard) y avisa por Telegram. Las claves viven solo en variables
// de entorno: TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID y FAMILIA_ORDERS_API_KEY (la misma que el backend).

const CATALOG_URL = `https://${
  process.env.VERCEL_PROJECT_PRODUCTION_URL || 'traelo-familia.vercel.app'
}/data/catalog-familia.json`

// Origen del backend (sin /api/v1). En producción: https://api.traelo-market.com
const API_ORIGIN = (process.env.TRAELO_API_ORIGIN || 'https://api.traelo-market.com').replace(/\/+$/, '')
const SAVE_TIMEOUT_MS = 10_000

const COOLDOWN_MS = 3 * 60 * 1000
const CATALOG_TTL_MS = 5 * 60 * 1000
const MAX_ITEMS = 60
const MAX_QTY = 99
const MAX_BODY_BYTES = 50_000

const lastByIp = new Map()
let catalogCache = { at: 0, byId: null }

function esc(text) {
  return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function fmt(value) {
  return Number.isInteger(value) ? `$${value}` : `$${value.toFixed(2)}`
}

function str(value, max) {
  if (typeof value !== 'string') return null
  const v = value.trim()
  return v.length > 0 && v.length <= max ? v : null
}

function clientIp(req) {
  const fwd = req.headers['x-forwarded-for']
  const first = (Array.isArray(fwd) ? fwd[0] : fwd || '').split(',')[0].trim()
  return first || req.headers['x-real-ip'] || 'desconocida'
}

async function getCatalog() {
  if (catalogCache.byId && Date.now() - catalogCache.at < CATALOG_TTL_MS) return catalogCache.byId
  const res = await fetch(CATALOG_URL)
  if (!res.ok) throw new Error(`catalog ${res.status}`)
  const data = await res.json()
  const byId = new Map(data.products.map(p => [p.id, p]))
  catalogCache = { at: Date.now(), byId }
  return byId
}

/** Valida el pedido y recalcula precios con el catálogo. Devuelve null si es inválido. */
function normalizeOrder(body, catalog) {
  if (!body || typeof body !== 'object') return null
  const a = body.address
  if (!a || typeof a !== 'object') return null

  // Zona de entrega: Güira, San Antonio u otro lugar (con el lugar escrito). Pedidos viejos sin zona = Güira.
  const ZONES = { guira: 'Güira de Melena', 'san-antonio': 'San Antonio de los Baños', otro: 'Otro lugar' }
  const zona = a.zona == null ? 'guira' : a.zona
  if (!Object.hasOwn(ZONES, zona)) return null
  const lugar = zona === 'otro' ? str(a.lugar, 150) : null
  if (zona === 'otro' && !lugar) return null

  const address = {
    zona,
    zonaLabel: ZONES[zona],
    lugar,
    nombreComprador: str(a.nombreComprador, 100),
    whatsappComprador: str(a.whatsappComprador, 30),
    nombreDestinatario: str(a.nombreDestinatario, 100),
    direccion: str(a.direccion, 300),
    observaciones: a.observaciones ? str(a.observaciones, 500) : null,
  }
  if (
    !address.nombreComprador ||
    !address.whatsappComprador ||
    !address.nombreDestinatario ||
    !address.direccion
  ) {
    return null
  }
  if (a.observaciones && !address.observaciones) return null

  const id = str(body.id, 40)
  if (!id) return null

  if (!Array.isArray(body.items) || body.items.length === 0 || body.items.length > MAX_ITEMS) {
    return null
  }

  const lines = []
  for (const raw of body.items) {
    const product = catalog.get(raw?.product?.id)
    const quantity = raw?.quantity
    if (!product || !Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QTY) return null
    if (product.stockStatus === 'agotado') return null

    let option = null
    if (raw.option != null) {
      if (!Array.isArray(product.options) || !product.options.includes(raw.option)) return null
      option = raw.option
    }
    let addon = null
    if (raw.addon != null) {
      addon = (product.addons || []).find(x => x.name === raw.addon?.name)
      if (!addon) return null
    }
    let packaging = null
    if (raw.packaging != null) {
      packaging = (product.packaging || []).find(x => x.name === raw.packaging?.name)
      if (!packaging) return null
    }

    const pack = product.formato && product.formato > 1 ? product.formato : 1
    const unitPrice = product.price + (addon?.price ?? 0) + (packaging?.price ?? 0)
    lines.push({ product, quantity, option, addon, packaging, pack, total: unitPrice * quantity * pack })
  }

  return { id, address, lines }
}

const round2 = n => Math.round(n * 100) / 100

/** Subtotal, comisión Zelle (10%) y total en USD — los mismos números en Telegram y en la base de datos. */
function computeTotals(lines) {
  const subtotal = round2(lines.reduce((sum, l) => sum + round2(l.total), 0))
  const commission = round2(subtotal * 0.1)
  return { subtotal, commission, total: round2(subtotal + commission) }
}

/** Guarda el pedido en la base de datos (backend). Idempotente por id: reintentar no duplica. */
async function saveOrder({ id, address, lines }, totals, key) {
  const payload = {
    clientOrderId: id,
    buyerName: address.nombreComprador,
    buyerWhatsapp: address.whatsappComprador,
    recipientName: address.nombreDestinatario,
    zone: address.zona,
    ...(address.lugar ? { place: address.lugar } : {}),
    address: address.direccion,
    ...(address.observaciones ? { notes: address.observaciones } : {}),
    items: lines.map(l => ({
      productRef: l.product.id,
      productName: l.product.name,
      businessName: l.product.businessName,
      ...(l.option ? { optionName: l.option } : {}),
      ...(l.addon ? { addonName: l.addon.name } : {}),
      ...(l.packaging ? { packagingName: l.packaging.name } : {}),
      quantity: l.quantity,
      pack: l.pack,
      lineTotalUsd: round2(l.total),
    })),
    subtotalUsd: totals.subtotal,
    zelleFeeUsd: totals.commission,
    totalUsd: totals.total,
  }
  try {
    const res = await fetch(`${API_ORIGIN}/api/v1/familia-orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Familia-Key': key },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(SAVE_TIMEOUT_MS),
    })
    if (!res.ok) return { ok: false }
    const body = await res.json().catch(() => null)
    return { ok: true, orderNumber: body?.data?.orderNumber ?? null }
  } catch {
    return { ok: false }
  }
}

function buildMessage({ id, address, lines }, ip, userAgent, totals, orderNumber) {
  const byBusiness = new Map()
  for (const line of lines) {
    const key = line.product.businessName
    if (!byBusiness.has(key)) byBusiness.set(key, [])
    byBusiness.get(key).push(line)
  }

  const out = [
    `🎁 <b>Pedido #${esc(id)}</b> — Tráelo Familia`,
    ...(orderNumber ? [`🗂 <b>Dashboard:</b> pestaña Familia, pedido #${orderNumber}`] : []),
    '',
    `👤 <b>Comprador:</b> ${esc(address.nombreComprador)}`,
    `📱 <b>WhatsApp:</b> ${esc(address.whatsappComprador)}`,
    '',
    `📦 <b>Para:</b> ${esc(address.nombreDestinatario)}`,
    `🗺 <b>Zona:</b> ${esc(address.zonaLabel)}${address.lugar ? ` — ${esc(address.lugar)}` : ''}`,
    `📍 <b>Dirección:</b> ${esc(address.direccion)}`,
    ...(address.observaciones ? [`📝 <b>Observaciones:</b> ${esc(address.observaciones)}`] : []),
    '',
  ]

  for (const [business, items] of byBusiness) {
    out.push(`🏪 <b>${esc(business)}</b>`)
    let groupTotal = 0
    for (const l of items) {
      const detalle =
        l.pack > 1
          ? `${l.quantity * l.pack} u (${l.quantity} caja${l.quantity > 1 ? 's' : ''} × ${l.pack})`
          : `× ${l.quantity}`
      let nombre = l.product.name
      if (l.option) nombre += ` (${l.option})`
      if (l.addon) nombre += ` + ${l.addon.name}`
      if (l.packaging) nombre += ` [${l.packaging.name}]`
      out.push(`   • ${esc(nombre)} ${detalle} — ${fmt(l.total)}`)
      groupTotal += l.total
    }
    out.push(`   <i>Subtotal: ${fmt(groupTotal)}</i>`, '')
  }

  out.push(
    `💵 Subtotal: ${fmt(totals.subtotal)} USD`,
    `➕ Comisión Zelle (10%): ${fmt(totals.commission)} USD`,
    `💳 <b>Total Zelle: ${fmt(totals.total)} USD</b>`,
    '',
    `📲 <i>Coordinar pago por WhatsApp</i>`,
    '',
    `🌐 <b>IP:</b> ${esc(ip)}`,
    `🖥 <b>Dispositivo:</b> ${esc(userAgent.slice(0, 200))}`,
  )
  return out.join('\n')
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ ok: false, error: 'method' })
  }

  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  const familiaKey = process.env.FAMILIA_ORDERS_API_KEY
  if (!token || !chatId || !familiaKey) return res.status(500).json({ ok: false, error: 'config' })

  const ip = clientIp(req)

  const last = lastByIp.get(ip)
  if (last && Date.now() - last < COOLDOWN_MS) {
    const retryAfter = Math.ceil((last + COOLDOWN_MS - Date.now()) / 1000)
    res.setHeader('Retry-After', String(retryAfter))
    return res.status(429).json({ ok: false, error: 'cooldown', retryAfter })
  }

  const size = Number(req.headers['content-length'] || 0)
  if (size > MAX_BODY_BYTES) return res.status(413).json({ ok: false, error: 'size' })

  let order
  try {
    const catalog = await getCatalog()
    order = normalizeOrder(req.body, catalog)
  } catch {
    return res.status(502).json({ ok: false, error: 'catalog' })
  }
  if (!order) return res.status(400).json({ ok: false, error: 'invalid' })

  // 1) Guardar en la base de datos. Si falla, NO se avisa por Telegram y el cliente ve el error (puede reintentar:
  //    el id del pedido lo hace idempotente, no se duplica).
  const totals = computeTotals(order.lines)
  const saved = await saveOrder(order, totals, familiaKey)
  if (!saved.ok) return res.status(502).json({ ok: false, error: 'save' })

  // 2) Avisar por Telegram. El pedido YA está guardado: si Telegram falla no se pierde, el personal lo ve en la
  //    pestaña Familia del dashboard, así que no se le muestra un error al cliente.
  const text = buildMessage(order, ip, String(req.headers['user-agent'] || 'desconocido'), totals, saved.orderNumber)

  try {
    const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    })
    const tg = await r.json().catch(() => null)
    if (!tg?.ok) console.error('Telegram no aceptó el aviso del pedido', order.id)
  } catch {
    console.error('Telegram no respondió para el pedido', order.id)
  }

  lastByIp.set(ip, Date.now())
  if (lastByIp.size > 5000) {
    for (const [k, t] of lastByIp) if (Date.now() - t > COOLDOWN_MS) lastByIp.delete(k)
  }
  return res.status(200).json({ ok: true })
}
