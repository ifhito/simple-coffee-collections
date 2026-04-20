'use client'

import React, { useState, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogoutButton } from '@/components/LogoutButton'
import { BeanMark } from '@/app/(app)/coffee/_components/shared/bean-mark'

type NavBarProps = {
  userEmail?: string | null
}

const navItems = [
  { href: '/coffee/my', label: 'マイコレクション', match: '/coffee/my' },
  { href: '/coffee/community', label: 'コミュニティ', match: '/coffee/community' },
  { href: '/shops', label: 'ショップ', match: '/shops' },
]

export function NavBar({ userEmail }: NavBarProps) {
  const pathname = usePathname() || '/'
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen((prev) => !prev)
  }, [])

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false)
  }, [])

  return (
    <>
      <div className="flex w-full items-center justify-between gap-6">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <BeanMark size={28} />
          <div className="text-left leading-none">
            <div className="font-serif-display text-[19px] text-[var(--ink)] group-hover:text-[var(--espresso)] transition-colors">
              Coffee Collections
            </div>
            <div className="font-mono-caps text-[9.5px] mt-1 text-[var(--ink-3)]">
              TASTING · NOTES · SINCE 2026
            </div>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav
          aria-label="メインナビゲーション"
          className="hidden sm:flex items-center gap-1"
        >
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.match)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative rounded-md px-3.5 py-2 text-sm transition ${
                  isActive
                    ? 'font-semibold text-[var(--ink)]'
                    : 'text-[var(--ink-3)] hover:text-[var(--ink)]'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0.5 left-3.5 right-3.5 h-px bg-[var(--ink)]" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {userEmail && (
            <div className="hidden sm:flex items-center gap-1 border-l border-[var(--rule)] pl-2">
              <Link
                href="/profile"
                className={`rounded-md px-3 py-2 text-sm transition ${
                  pathname === '/profile'
                    ? 'font-semibold text-[var(--ink)]'
                    : 'text-[var(--ink-3)] hover:text-[var(--ink)]'
                }`}
                aria-current={pathname === '/profile' ? 'page' : undefined}
              >
                プロフィール
              </Link>
              <Link
                href="/ai"
                className={`rounded-md px-3 py-2 text-sm transition ${
                  pathname.startsWith('/ai')
                    ? 'font-semibold text-[var(--ink)]'
                    : 'text-[var(--ink-3)] hover:text-[var(--ink)]'
                }`}
                aria-current={pathname.startsWith('/ai') ? 'page' : undefined}
              >
                AI
              </Link>
              <LogoutButton variant="text" />
            </div>
          )}
          <Link
            href="/coffee/new"
            className="inline-flex items-center gap-2 rounded-full bg-[var(--ink)] px-4 py-2 text-sm font-medium text-[var(--background)] transition hover:bg-[var(--espresso)]"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
            新規作成
          </Link>

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={toggleMobileMenu}
            className="sm:hidden inline-flex items-center justify-center rounded-md p-2 text-[var(--ink-2)] hover:bg-[var(--background-2)] transition"
            aria-expanded={isMobileMenuOpen}
            aria-label="メニュー"
          >
            {isMobileMenuOpen ? (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            ) : (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="sm:hidden mt-4 space-y-2 border-t border-[var(--rule)] pt-4">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.match)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMobileMenu}
                  className={`block rounded-md px-3 py-2 text-base font-medium transition ${
                    isActive
                      ? 'bg-[var(--background-2)] text-[var(--ink)]'
                      : 'text-[var(--ink-2)] hover:bg-[var(--background-2)]'
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>
          {userEmail && (
            <div className="space-y-1 border-t border-[var(--rule)] pt-2">
              <Link
                href="/profile"
                onClick={closeMobileMenu}
                className="block rounded-md px-3 py-2 text-base font-medium text-[var(--ink-2)] hover:bg-[var(--background-2)]"
              >
                プロフィール
              </Link>
              <Link
                href="/ai"
                onClick={closeMobileMenu}
                className="block rounded-md px-3 py-2 text-base font-medium text-[var(--ink-2)] hover:bg-[var(--background-2)]"
              >
                AI機能
              </Link>
              <div className="px-3 py-2">
                <LogoutButton variant="text" />
              </div>
            </div>
          )}
        </div>
      )}
    </>
  )
}
