/** Versión de esta build (package.json → vite `define`). */
export const APP_VERSION: string = __APP_VERSION__

/** Compara versiones "1.0.1" numéricamente: <0 si a es anterior a b, 0 si son iguales, >0 si a es posterior. */
export function compareVersions(a: string, b: string): number {
  const pa = a.split('.').map((n) => parseInt(n, 10) || 0)
  const pb = b.split('.').map((n) => parseInt(n, 10) || 0)
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const diff = (pa[i] ?? 0) - (pb[i] ?? 0)
    if (diff !== 0) return diff
  }
  return 0
}

/** Datos que guarda la app en el navegador: si existen y no hay versión registrada, es un cliente de antes. */
const LEGACY_KEYS = ['traelo_cart', 'traelo_orders', 'traelo_address', 'traelo_familia_catalog_v2']

/**
 * ¿Hay que pedirle que actualice? Sí cuando la versión guardada es anterior a la actual, o cuando no hay
 * ninguna pero el navegador ya tiene datos de la app (se usó antes de que existieran las versiones).
 * Un visitante nuevo (sin nada guardado) no ve el aviso: ya trae la versión actual.
 */
export function needsUpdate(stored: string | null, hasLegacyData: boolean): boolean {
  if (stored) return compareVersions(stored, APP_VERSION) < 0
  return hasLegacyData
}

export function hasLegacyData(): boolean {
  try {
    return LEGACY_KEYS.some((key) => localStorage.getItem(key) !== null)
  } catch {
    return false
  }
}
