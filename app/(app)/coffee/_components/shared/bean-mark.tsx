import { memo } from 'react'

type BeanMarkProps = {
  size?: number
  color?: string
  className?: string
}

function BeanMarkComponent({ size = 40, color = 'var(--espresso)', className }: BeanMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      className={className}
      role="img"
      aria-label="coffee bean"
    >
      <ellipse
        cx="20"
        cy="20"
        rx="11"
        ry="16"
        transform="rotate(22 20 20)"
        fill={color}
      />
      <path
        d="M14 10 C 18 18, 18 22, 14 30"
        stroke="var(--background)"
        strokeWidth="1.4"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  )
}

export const BeanMark = memo(BeanMarkComponent)
