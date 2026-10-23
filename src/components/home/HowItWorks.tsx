const STEPS = [
  { emoji: '🎁', title: 'Elige el regalo', desc: 'Combos o productos para tu familia.' },
  { emoji: '📝', title: 'Completa los datos', desc: 'Tu WhatsApp y la dirección de quien recibe.' },
  { emoji: '💳', title: 'Paga por Zelle', desc: 'Te contactamos para coordinar.' },
  { emoji: '🚀', title: 'Entregamos', desc: 'En Güira, San Antonio u otro lugar que coordinemos.' },
]

export function HowItWorks() {
  return (
    <div className="flex gap-2.5 overflow-x-auto scrollbar-none -mx-4 px-4 pb-1">
      {STEPS.map((step, i) => (
        <div key={step.title} className="flex-shrink-0 w-[140px] bg-surface border border-border rounded-2xl p-3">
          <span className="text-2xl">{step.emoji}</span>
          <p className="text-[10px] font-bold text-primary mt-1.5 mb-0.5">Paso {i + 1}</p>
          <p className="text-xs font-bold text-text-primary leading-snug">{step.title}</p>
          <p className="text-[10px] text-text-secondary mt-0.5 leading-relaxed">{step.desc}</p>
        </div>
      ))}
    </div>
  )
}
