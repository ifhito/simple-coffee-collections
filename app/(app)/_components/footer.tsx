import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} Coffee Collections
          </p>
          <nav className="flex items-center gap-6">
            <Link
              href="/company"
              className="text-sm text-gray-500 hover:text-gray-700 transition"
            >
              企業情報
            </Link>
            <Link
              href="/contact"
              className="text-sm text-gray-500 hover:text-gray-700 transition"
            >
              お問い合わせ
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}
