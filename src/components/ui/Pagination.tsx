interface PaginationProps {
  page: number
  totalPages: number
  onChange: (page: number) => void
}

export function Pagination({ page, totalPages, onChange }: PaginationProps) {
  if (totalPages <= 1) return null

  const pages: (number | '…')[] = []
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    pages.push(1)
    if (page > 3) pages.push('…')
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i)
    if (page < totalPages - 2) pages.push('…')
    pages.push(totalPages)
  }

  return (
    <nav className="flex items-center justify-center gap-1.5 pt-2" aria-label="Paginación">
      <PageBtn disabled={page === 1} onClick={() => onChange(page - 1)} aria-label="Anterior">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </PageBtn>

      {pages.map((p, i) =>
        p === '…' ? (
          <span key={`gap-${i}`} className="w-9 text-center text-text-secondary">…</span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p)}
            aria-current={p === page ? 'page' : undefined}
            className={`min-w-9 h-9 px-2 rounded-xl text-sm font-bold transition-colors ${
              p === page
                ? 'bg-gradient-primary text-white shadow-btn-primary'
                : 'bg-surface border border-border text-text-primary hover:border-primary/40'
            }`}
          >
            {p}
          </button>
        )
      )}

      <PageBtn disabled={page === totalPages} onClick={() => onChange(page + 1)} aria-label="Siguiente">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </PageBtn>
    </nav>
  )
}

function PageBtn({
  children,
  disabled,
  onClick,
  ...rest
}: {
  children: React.ReactNode
  disabled?: boolean
  onClick: () => void
} & React.AriaAttributes) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-9 h-9 rounded-xl bg-surface border border-border text-text-primary flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:border-primary/40 transition-colors"
      {...rest}
    >
      {children}
    </button>
  )
}
