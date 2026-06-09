import type { Business } from '../types'

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + (m || 0)
}

/** ¿El negocio está abierto ahora mismo? */
export function isOpenNow(business: Business, now: Date = new Date()): boolean {
  const { schedule } = business
  if (!schedule.days.includes(now.getDay())) return false
  const cur = now.getHours() * 60 + now.getMinutes()
  return cur >= toMinutes(schedule.open) && cur < toMinutes(schedule.close)
}

/** Texto corto del horario, ej: "Lun–Sáb · 9:00 am – 5:00 pm". */
export function scheduleLabel(business: Business): string {
  return business.schedule.label
}
