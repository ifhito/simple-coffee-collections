import React, { AnchorHTMLAttributes, ReactNode } from 'react'

type LinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
  href: string | { pathname?: string }
  children: ReactNode
}

export default function Link({ href, children, ...props }: LinkProps) {
  const resolvedHref = typeof href === 'string' ? href : (href.pathname ?? '#')

  return (
    <a href={resolvedHref} {...props}>
      {children}
    </a>
  )
}
