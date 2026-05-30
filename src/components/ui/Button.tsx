import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'soft' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  children: ReactNode
}

const variants = {
  primary:
    'bg-gradient-primary text-white shadow-btn-primary hover:brightness-105 active:scale-[0.98]',
  outline:
    'bg-surface border border-border text-text-primary hover:border-primary/40 active:scale-[0.98]',
  soft: 'bg-primary/10 text-primary hover:bg-primary/15 active:scale-[0.98]',
  ghost: 'text-text-secondary hover:text-text-primary hover:bg-black/5',
  danger: 'bg-danger text-white hover:bg-red-700 active:scale-[0.98]',
}

const sizes = {
  sm: 'h-9 px-4 text-sm rounded-xl',
  md: 'h-11 px-5 text-sm rounded-2xl',
  lg: 'h-14 px-6 text-base rounded-2xl',
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={[
        'inline-flex items-center justify-center gap-2 font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        variants[variant],
        sizes[size],
        fullWidth ? 'w-full' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </button>
  )
}
