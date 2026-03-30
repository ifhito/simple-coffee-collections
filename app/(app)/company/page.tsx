import Link from 'next/link'

export const metadata = {
  title: '企業情報 | Coffee Collections',
  description: 'Simple Coffee Collections の運営者情報・サービス概要',
}

export default function CompanyPage() {
  return (
    <div className="max-w-2xl mx-auto py-12 px-4 space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">企業情報</h1>

      <section className="space-y-4">
        <dl className="divide-y divide-gray-100 border border-gray-200 rounded-lg overflow-hidden">
          <div className="grid grid-cols-3 gap-4 px-6 py-4 bg-gray-50">
            <dt className="text-sm font-medium text-gray-600">サービス名</dt>
            <dd className="col-span-2 text-sm text-gray-900">Simple Coffee Collections</dd>
          </div>
          <div className="grid grid-cols-3 gap-4 px-6 py-4">
            <dt className="text-sm font-medium text-gray-600">運営者</dt>
            <dd className="col-span-2 text-sm text-gray-900">ifhito（個人運営）</dd>
          </div>
          <div className="grid grid-cols-3 gap-4 px-6 py-4 bg-gray-50">
            <dt className="text-sm font-medium text-gray-600">所在地</dt>
            <dd className="col-span-2 text-sm text-gray-900">日本</dd>
          </div>
          <div className="grid grid-cols-3 gap-4 px-6 py-4">
            <dt className="text-sm font-medium text-gray-600">サービス概要</dt>
            <dd className="col-span-2 text-sm text-gray-900">
              購入したコーヒー豆のテイスティングノートを記録・評価・共有できる個人向けコーヒージャーナルアプリです。
            </dd>
          </div>
          <div className="grid grid-cols-3 gap-4 px-6 py-4 bg-gray-50">
            <dt className="text-sm font-medium text-gray-600">連絡先</dt>
            <dd className="col-span-2 text-sm text-gray-900">
              <Link href="/contact" className="text-amber-600 hover:text-amber-700 underline">
                お問い合わせページ
              </Link>
              をご利用ください。
            </dd>
          </div>
        </dl>
      </section>
    </div>
  )
}
