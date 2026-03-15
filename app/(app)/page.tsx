import Link from 'next/link'

export const metadata = {
  title: 'ホーム | Coffee Collections',
  description: 'あなたのコーヒーコレクション',
}

const features = [
  {
    emoji: '📝',
    title: 'マイページ',
    description: '自分のコーヒー記録を一覧・管理できます。評価の編集や削除も簡単に行えます。',
    href: '/coffee/my',
    label: 'マイページへ',
  },
  {
    emoji: '🌐',
    title: 'コミュニティ',
    description: 'みんなの公開評価をチェックしましょう。新しいコーヒーや店舗の発見に役立てられます。',
    href: '/coffee/community',
    label: 'コミュニティを見る',
  },
  {
    emoji: '➕',
    title: '新規評価を記録',
    description: 'カフェ訪問やコーヒーの体験を記録しましょう。店名・豆の種類・感想を残せます。',
    href: '/coffee/new',
    label: '記録する',
  },
]

export default function HomePage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          ようこそ、Coffee Collectionsへ
        </h2>
        <p className="text-gray-600">
          カフェ訪問やコーヒーの体験を記録・共有できるコーヒージャーナルです。
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {features.map((feature) => (
          <Link
            key={feature.href}
            href={feature.href}
            className="block bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
          >
            <div className="text-3xl mb-3">{feature.emoji}</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
            <p className="text-sm text-gray-600 mb-4">{feature.description}</p>
            <span className="text-sm font-medium text-amber-600 hover:text-amber-700">
              {feature.label} →
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
