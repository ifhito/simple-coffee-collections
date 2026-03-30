export const metadata = {
  title: 'お問い合わせ | Coffee Collections',
  description: 'Simple Coffee Collections へのお問い合わせ方法',
}

export default function ContactPage() {
  return (
    <div className="max-w-2xl mx-auto py-12 px-4 space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">お問い合わせ</h1>

      <p className="text-gray-600">
        本サービスに関するご質問・ご要望・不具合のご報告は、GitHub Issues よりご連絡ください。
      </p>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 space-y-4">
        <p className="text-sm text-gray-700">
          バグ報告や機能リクエストは以下のリンクからお気軽にお送りください。
        </p>
        <a
          href="https://github.com/ifhito/simple-coffee-collections/issues"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold px-5 py-2.5 text-sm transition-colors"
        >
          GitHub Issues で問い合わせる
        </a>
      </div>

      <div className="space-y-2">
        <p className="text-sm text-gray-700">メールでのお問い合わせ:</p>
        <p className="text-sm text-gray-700">hito01010101[at]gmail.com</p>
      </div>

      <p className="text-sm text-gray-500">
        ※ 本サービスは個人が運営しています。返答までお時間をいただく場合がございます。
      </p>
    </div>
  )
}
