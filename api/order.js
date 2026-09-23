// Función serverless de Vercel: recibe el pedido, lo valida contra el catálogo
// y lo envía a Telegram. El token vive solo en variables de entorno.

const CATALOG_URL = `https://${
  process.env.VERCEL_PROJECT_PRODUCTION_URL || 'traelo-familia.vercel.app'
}/data/catalog-familia.json`

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

  const address = {
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

function buildMessage({ id, address, lines }, ip, userAgent) {
  const byBusiness = new Map()
  for (const line of lines) {
    const key = line.product.businessName
    if (!byBusiness.has(key)) byBusiness.set(key, [])
    byBusiness.get(key).push(line)
  }

  const out = [
    `🎁 <b>Pedido #${esc(id)}</b> — Tráelo Familia`,
    '',
    `👤 <b>Comprador:</b> ${esc(address.nombreComprador)}`,
    `📱 <b>WhatsApp:</b> ${esc(address.whatsappComprador)}`,
    '',
    `📦 <b>Para:</b> ${esc(address.nombreDestinatario)}`,
    `📍 <b>Dirección:</b> ${esc(address.direccion)}`,
    ...(address.observaciones ? [`📝 <b>Observaciones:</b> ${esc(address.observaciones)}`] : []),
    '',
  ]

  let subtotal = 0
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
    subtotal += groupTotal
  }

  subtotal = Math.round(subtotal * 100) / 100
  const commission = Math.round(subtotal * 0.1 * 100) / 100
  const total = Math.round((subtotal + commission) * 100) / 100

  out.push(
    `💵 Subtotal: ${fmt(subtotal)} USD`,
    `➕ Comisión Zelle (10%): ${fmt(commission)} USD`,
    `💳 <b>Total Zelle: ${fmt(total)} USD</b>`,
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
  if (!token || !chatId) return res.status(500).json({ ok: false, error: 'config' })

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

  const text = buildMessage(order, ip, String(req.headers['user-agent'] || 'desconocido'))

  let tg
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
    tg = await r.json().catch(() => null)
  } catch {
    return res.status(502).json({ ok: false, error: 'telegram' })
  }
  if (!tg?.ok) return res.status(502).json({ ok: false, error: 'telegram' })

  lastByIp.set(ip, Date.now())
  if (lastByIp.size > 5000) {
    for (const [k, t] of lastByIp) if (Date.now() - t > COOLDOWN_MS) lastByIp.delete(k)
  }
  return res.status(200).json({ ok: true })
}
