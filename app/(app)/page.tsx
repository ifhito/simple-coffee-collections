import Link from 'next/link'

export const metadata = {
  title: 'ホーム | Coffee Collections',
  description: '購入したコーヒー豆をテイスティングして記録・共有できるコーヒージャーナル',
}

const features = [
  {
    emoji: '🫘',
    title: '豆を記録',
    description:
      '購入した豆の産地・品種・焙煎度を残せます。どこで買ったか、感想もあわせてメモしておけば、次の豆選びに役立ちます。',
    href: '/coffee/new',
    label: '記録を始める',
  },
  {
    emoji: '⭐',
    title: 'テイスティング評価',
    description:
      '酸味・苦味・香り・総合評価を 1〜10 のスライダーで評価。自分の好みの傾向が見えてきます。',
    href: '/coffee/my',
    label: 'マイページへ',
  },
  {
    emoji: '🌐',
    title: 'コミュニティで発見',
    description:
      'ほかのユーザーが公開した評価をチェックして、気になる豆や購入先を探しましょう。',
    href: '/coffee/community',
    label: 'コミュニティを見る',
  },
]

const steps = [
  { number: '01', title: '豆を購入する', description: 'ロースターやオンラインショップで気になる豆を手に入れる。' },
  { number: '02', title: 'テイスティングして記録', description: '淹れて飲んだ印象・評価をアプリに残す。後から編集もできます。' },
  { number: '03', title: 'コミュニティで共有', description: '公開設定をオンにするだけで、みんなと発見を共有できます。' },
]

export default function HomePage() {
  return (
    <div className="space-y-20 pb-16">
      {/* Hero */}
      <section className="text-center py-16 px-4">
        <div className="inline-block bg-amber-100 text-amber-800 text-xs font-semibold px-3 py-1 rounded-full mb-6 uppercase tracking-wide">
          🫘 あなただけのコーヒー豆ログ
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight mb-5">
          出会った豆を、<br />
          <span className="bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent">
            記録・評価・共有。
          </span>
        </h1>
        <p className="text-lg text-gray-500 max-w-xl mx-auto mb-8">
          購入したコーヒー豆のテイスティングノートを残して、お気に入りの一袋を見つけよう。
          コミュニティと共有して、新しい豆との出会いを広げましょう。
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/coffee/new"
            className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold shadow transition-colors"
          >
            記録を始める →
          </Link>
          <Link
            href="/coffee/community"
            className="inline-flex items-center justify-center px-6 py-3 rounded-lg border border-gray-300 hover:border-amber-400 text-gray-700 font-semibold transition-colors"
          >
            コミュニティを見る
          </Link>
        </div>
      </section>

      {/* Features */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">主な機能</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {features.map((f) => (
            <Link
              key={f.href}
              href={f.href}
              className="group flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-lg transition-shadow"
            >
              <div className="text-4xl mb-4">{f.emoji}</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 flex-1 mb-4">{f.description}</p>
              <span className="text-sm font-medium text-amber-600 group-hover:text-amber-700">
                {f.label} →
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">使い方</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {steps.map((step) => (
            <div key={step.number} className="flex flex-col items-center text-center px-4">
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-amber-100 text-amber-700 font-bold text-lg mb-4">
                {step.number}
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
              <p className="text-sm text-gray-500">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-10 text-center border border-amber-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          最初の豆を記録しよう
        </h2>
        <p className="text-gray-500 mb-6">
          今すぐ始められます。あなたのコーヒー豆コレクションを積み重ねていきましょう。
        </p>
        <Link
          href="/coffee/new"
          className="inline-flex items-center justify-center px-8 py-3 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold shadow transition-colors"
        >
          🫘 記録を始める
        </Link>
      </section>
    </div>
  )
}
