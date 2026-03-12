'use client'

import React, { useState, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogoutButton } from '@/components/LogoutButton'

type NavBarProps = {
  userEmail?: string | null
}

const navItems = [
  { href: '/coffee/my', label: '📝 マイページ', match: '/coffee/my' },
  { href: '/coffee/community', label: '🌐 コミュニティ', match: '/coffee/community' },
  { href: '/shops', label: '🏪 店舗', match: '/shops' },
]

export function NavBar({ userEmail }: NavBarProps) {
  const pathname = usePathname() || '/'
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Memoized toggle handler to prevent unnecessary re-renders
  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen((prev) => !prev)
  }, [])

  // Memoized handler to close menu after navigation
  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false)
  }, [])

  return (
    <>
      <div className="flex w-full items-center justify-between">
        {/* Left side: Brand + Navigation */}
        <div className="flex items-center gap-6">
          <Link href="/" className="text-2xl font-bold text-gray-900 hover:text-gray-700 transition">
            Coffee Collections
          </Link>
          <nav aria-label="メインナビゲーション" className="hidden sm:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.match)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-md px-3 py-2 text-sm font-medium transition ${
                    isActive
                      ? 'bg-amber-100 text-amber-800'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Right side: User menu + Actions */}
        <div className="flex items-center gap-3">
          {userEmail && (
            <div className="hidden sm:flex items-center gap-3 border-l border-gray-200 pl-3">
              <Link
                href="/profile"
                className={`rounded-md px-3 py-2 text-sm font-medium transition ${
                  pathname === '/profile'
                    ? 'bg-amber-100 text-amber-800'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                aria-current={pathname === '/profile' ? 'page' : undefined}
              >
                プロフィール
              </Link>
              <Link
                href="/ai"
                className={`rounded-md px-3 py-2 text-sm font-medium transition ${
                  pathname.startsWith('/ai')
                    ? 'bg-amber-100 text-amber-800'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                aria-current={pathname.startsWith('/ai') ? 'page' : undefined}
              >
                AI機能
              </Link>
              <LogoutButton variant="text" />
            </div>
          )}
          <Link
            href="/coffee/new"
            className="rounded-md bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-700 shadow-sm"
          >
            New Evaluation
          </Link>

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={toggleMobileMenu}
            className="sm:hidden inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition"
            aria-expanded={isMobileMenuOpen}
            aria-label="メニュー"
          >
            {isMobileMenuOpen ? (
              // Close icon (X)
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              // Hamburger icon
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="sm:hidden mt-4 space-y-2 border-t border-gray-200 pt-4">
          {/* Navigation links */}
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
                      ? 'bg-amber-100 text-amber-800'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>
          
          {/* User menu */}
          {userEmail && (
            <div className="space-y-1 border-t border-gray-200 pt-2">
              <Link
                href="/profile"
                onClick={closeMobileMenu}
                className={`block rounded-md px-3 py-2 text-base font-medium transition ${
                  pathname === '/profile'
                    ? 'bg-amber-100 text-amber-800'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                aria-current={pathname === '/profile' ? 'page' : undefined}
              >
                プロフィール
              </Link>
              <Link
                href="/ai"
                onClick={closeMobileMenu}
                className={`block rounded-md px-3 py-2 text-base font-medium transition ${
                  pathname.startsWith('/ai')
                    ? 'bg-amber-100 text-amber-800'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                aria-current={pathname.startsWith('/ai') ? 'page' : undefined}
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
