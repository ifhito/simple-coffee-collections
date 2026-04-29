import React, { InputHTMLAttributes } from 'react'

type InputProps = {
  label?: string
  error?: string
} & InputHTMLAttributes<HTMLInputElement>

export function Input({
  label,
  error,
  id,
  required,
  disabled,
  className = '',
  ...props
}: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
  const errorId = error ? `${inputId}-error` : undefined

  const baseStyles =
    'w-full px-3 py-2 border rounded-sm bg-[var(--paper)] text-[var(--ink)] placeholder:text-[var(--ink-3)] focus:outline-none focus:ring-2 focus:ring-[var(--espresso)]/30 focus:border-[var(--espresso)]'
  const errorStyles = error ? 'border-red-400 focus:ring-red-300' : 'border-[var(--rule)]'
  const disabledStyles = disabled ? 'opacity-50 cursor-not-allowed bg-[var(--background-2)]' : ''

  const combinedClassName =
    `${baseStyles} ${errorStyles} ${disabledStyles} ${className}`.trim()

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-[var(--ink-2)] mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        id={inputId}
        className={combinedClassName}
        disabled={disabled}
        required={required}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={errorId}
        {...props}
      />
      {error && (
        <p id={errorId} className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}
