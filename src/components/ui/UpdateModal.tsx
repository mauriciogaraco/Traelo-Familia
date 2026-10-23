import { useEffect, useState } from 'react'
import { readStorage, writeStorage, STORAGE_KEYS } from '../../lib/storage'
import { APP_VERSION, hasLegacyData, needsUpdate } from '../../lib/version'

const CLEANUP_TIMEOUT_MS = 3000

/** Da de baja los service workers y borra el caché de la app. NO toca localStorage (carrito, pedidos, datos). */
async function clearAppCaches(): Promise<void> {
  const work = (async () => {
    if ('serviceWorker' in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations()
      await Promise.all(regs.map((r) => r.unregister()))
    }
    if ('caches' in window) {
      const keys = await caches.keys()
      await Promise.all(keys.map((k) => caches.delete(k)))
    }
  })()
  // Nunca dejar el botón colgado: si algo tarda, se recarga igual.
  await Promise.race([work.catch(() => {}), new Promise((resolve) => setTimeout(resolve, CLEANUP_TIMEOUT_MS))])
}

/**
 * Al cargar la web, si el navegador tiene una versión anterior a la actual (o datos de antes de que
 * existieran las versiones), se muestra un modal para actualizar: limpia el caché de la app y recarga.
 * Quien entra por primera vez solo registra la versión, sin aviso.
 */
export function UpdateModal() {
  const [open, setOpen] = useState(() => needsUpdate(readStorage<string | null>(STORAGE_KEYS.appVersion, null), hasLegacyData()))
  const [busy, setBusy] = useState(false)

  // Visitante nuevo o ya al día: se anota la versión actual.
  useEffect(() => {
    if (!open) writeStorage(STORAGE_KEYS.appVersion, APP_VERSION)
  }, [open])

  if (!open) return null

  async function update() {
    if (busy) return
    setBusy(true)
    writeStorage(STORAGE_KEYS.appVersion, APP_VERSION)
    await clearAppCaches()
    setOpen(false)
    window.location.reload()
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm px-6" role="dialog" aria-modal="true" aria-labelledby="update-title">
      <div className="w-full max-w-[360px] bg-surface rounded-4xl shadow-2xl p-6 text-center animate-scale-in">
        <div className="text-5xl mb-3" aria-hidden="true">
          🔄
        </div>
        <h2 id="update-title" className="text-xl font-extrabold text-text-primary">
          Nueva versión disponible
        </h2>
        <p className="text-sm text-text-secondary mt-2">
          Actualiza Tráelo Familia para ver las novedades: buscador, negocios por localidad y más. Tu carrito y tus datos se conservan.
        </p>
        <button
          onClick={update}
          disabled={busy}
          className="mt-5 w-full h-12 rounded-2xl bg-gradient-primary text-white font-bold shadow-btn-primary active:scale-[0.98] transition-transform disabled:opacity-60"
        >
          {busy ? 'Actualizando...' : 'Actualizar ahora'}
        </button>
        <p className="text-[11px] text-text-secondary mt-3">Versión {APP_VERSION}</p>
      </div>
    </div>
  )
}
