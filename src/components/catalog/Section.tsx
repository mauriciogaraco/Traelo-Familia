import type { ReactNode } from 'react'

export function Section({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section>
      <div className="flex items-end justify-between mb-3">
        <h2 className="flex items-center gap-2.5 text-[1.35rem] font-extrabold text-text-primary tracking-[-0.02em]">
          <span className="w-1.5 h-6 rounded-full bg-gradient-primary" aria-hidden="true" />
          {title}
        </h2>
        {action && <div className="pb-0.5">{action}</div>}
      </div>
      {children}
    </section>
  )
}

/** Fila con scroll horizontal; las tarjetas hijas llevan su propio ancho. */
export function Rail({ children }: { children: ReactNode }) {
  return <div className="flex gap-3 overflow-x-auto scrollbar-none -mx-4 px-4 pb-2 items-stretch">{children}</div>
}
