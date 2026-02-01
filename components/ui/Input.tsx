import React, { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

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

  const baseStyles = 'w-full px-3 py-2 border rounded-md bg-white text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 autofill:bg-white autofill:text-gray-800 autofill:shadow-[inset_0_0_0px_1000px_rgb(255,255,255)]'
  const errorStyles = error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
  const disabledStyles = disabled ? 'opacity-50 cursor-not-allowed bg-gray-100' : ''

  const combinedClassName = `${baseStyles} ${errorStyles} ${disabledStyles} ${className}`.trim()

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
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
