import React, { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonProps = {
  children: ReactNode
  variant?: 'primary' | 'secondary'
  fullWidth?: boolean
  loading?: boolean
} & ButtonHTMLAttributes<HTMLButtonElement>

export function Button({
  children,
  variant = 'primary',
  fullWidth = false,
  loading = false,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center px-5 py-2.5 rounded-full text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[var(--espresso)]'

  const variantStyles = {
    primary:
      'bg-[var(--ink)] text-[var(--background)] hover:bg-[var(--espresso)]',
    secondary:
      'border border-[var(--rule)] bg-[var(--paper)] text-[var(--ink)] hover:border-[var(--ink)]',
  }

  const widthStyles = fullWidth ? 'w-full' : ''
  const disabledStyles = disabled || loading ? 'opacity-50 cursor-not-allowed' : ''

  const combinedClassName =
    `${baseStyles} ${variantStyles[variant]} ${widthStyles} ${disabledStyles} ${className}`.trim()

  return (
    <button className={combinedClassName} disabled={disabled || loading} {...props}>
      {loading ? '処理中...' : children}
    </button>
  )
}
