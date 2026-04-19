import Link from 'next/link'
import { RadarChart } from '@/app/(app)/coffee/_components/shared/radar-chart'
import { BeanMark } from '@/app/(app)/coffee/_components/shared/bean-mark'
import { ScoreBar } from '@/app/(app)/coffee/_components/shared/score-bar'

export const metadata = {
  title: 'ホーム | Coffee Collections',
  description:
    '出会った豆を、しずかに記録する。テイスティングノートを積み重ねるコーヒージャーナル',
}

function SectionLabel({ n, title }: { n: string; title: string }) {
  return (
    <div className="mb-5 flex items-baseline gap-3.5">
      <span className="font-mono-num text-[11px] tracking-[0.12em] text-[var(--ink-3)]">
        {n}
      </span>
      <span className="h-px w-10 bg-[var(--rule)]" />
      <span className="font-mono-caps text-xs font-semibold text-[var(--espresso)]">
        {title}
      </span>
    </div>
  )
}

const steps = [
  {
    n: '01',
    icon: '豆',
    title: '豆を手に入れる',
    description:
      'ロースターやオンラインショップで、気になる豆を一袋。袋の情報を手元に開いておく。',
  },
  {
    n: '02',
    icon: '淹',
    title: '淹れて、味わう',
    description:
      '抽出方法は自由。一口目・二口目・冷めてからの三段階で感じたことをメモする。',
  },
  {
    n: '03',
    icon: '記',
    title: 'ノートを残す',
    description:
      '4軸のスライダーと自由記述で記録。公開/非公開はいつでも切り替え可能です。',
  },
]

const exampleProfile = {
  overall: 8.3,
  acidity: 7.6,
  aroma: 8.1,
  bitter: 4.4,
}

export default function HomePage() {
  return (
    <div className="-mx-4 sm:-mx-6">
      {/* HERO */}
      <section className="border-b border-[var(--rule)]">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 pb-14 pt-10 md:grid-cols-[1.2fr_1fr] md:gap-14 md:pt-14">
          <div className="flex flex-col justify-between">
            <div className="flex items-center gap-3 text-[var(--ink-3)]">
              <span className="font-mono-caps text-[11px]">
                ISSUE No. 042
              </span>
              <span className="h-px w-7 bg-[var(--rule)]" />
              <span className="font-mono-caps text-[11px]">APR · 2026</span>
            </div>
            <h1 className="font-serif-display my-6 text-balance text-[clamp(3rem,7.5vw,7rem)] leading-[0.92] tracking-tight">
              出会った豆を、
              <br />
              <em className="not-italic text-[var(--espresso)] [font-style:italic]">
                しずかに
              </em>
              記録する。
            </h1>
            <p className="mb-8 max-w-xl text-base leading-relaxed text-[var(--ink-2)] sm:text-[17px]">
              淹れて、飲んで、書きとめる。テイスティングノートを残し、自分だけのコーヒー辞書をつくる。気に入った一袋はコミュニティに共有して、次の出会いにつなげよう。
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/coffee/new"
                className="inline-flex items-center gap-2.5 rounded-full bg-[var(--ink)] px-6 py-3.5 text-sm font-medium text-[var(--background)] transition hover:bg-[var(--espresso)]"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                最初のノートを書く
              </Link>
              <Link
                href="/coffee/community"
                className="inline-flex items-center rounded-full border border-[var(--ink)] px-6 py-3 text-sm text-[var(--ink)] transition hover:bg-[var(--ink)] hover:text-[var(--background)]"
              >
                コミュニティを見る →
              </Link>
            </div>
          </div>

          {/* Right — decorative tasting-sheet card */}
          <aside className="rounded-sm border border-[var(--rule)] bg-[var(--paper)] p-6 shadow-[0_20px_40px_-30px_rgba(60,30,10,0.3)]">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-mono-caps text-[10px] text-[var(--espresso)]">
                  SAMPLE SHEET
                </div>
                <div className="mt-0.5 font-serif-display text-[13px] italic text-[var(--ink-3)]">
                  テイスティングシートのイメージ
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono-caps text-[10px] text-[var(--ink-3)]">
                  OVERALL
                </div>
                <div className="font-serif-display mt-0.5 text-[44px] leading-none">
                  {exampleProfile.overall.toFixed(1)}
                </div>
              </div>
            </div>
            <div className="my-4 grid place-items-center">
              <RadarChart
                values={exampleProfile}
                size={240}
                color="var(--espresso)"
              />
            </div>
            <div className="space-y-2.5 border-t border-[var(--rule-2)] pt-4">
              <ScoreBar label="OVERALL" value={exampleProfile.overall} color="var(--rating-overall)" />
              <ScoreBar label="ACIDITY" value={exampleProfile.acidity} color="var(--rating-acidity)" />
              <ScoreBar label="AROMA"   value={exampleProfile.aroma}   color="var(--rating-aroma)" />
              <ScoreBar label="BITTER"  value={exampleProfile.bitter}  color="var(--rating-bitter)" />
            </div>
          </aside>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="border-b border-[var(--rule)]">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <SectionLabel n="§01" title="HOW IT WORKS · 使い方" />
          <div className="grid grid-cols-1 gap-0 md:grid-cols-3">
            {steps.map((s, i) => (
              <div
                key={s.n}
                className={`py-6 md:py-0 ${
                  i > 0 ? 'md:border-l md:border-[var(--rule)] md:pl-7' : ''
                } md:pr-7`}
              >
                <div className="flex items-baseline gap-3.5">
                  <span className="font-serif-display text-5xl italic leading-none text-[var(--espresso)]">
                    {s.n}
                  </span>
                  <span className="font-serif-display text-lg text-[var(--ink-3)]">
                    {s.icon}
                  </span>
                </div>
                <h3 className="font-serif-display mt-3 text-[26px] tracking-tight">
                  {s.title}
                </h3>
                <p className="mt-2.5 max-w-xs text-sm leading-relaxed text-[var(--ink-2)]">
                  {s.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FLAVOR MAP */}
      <section className="border-b border-[var(--rule)]">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 py-16 md:grid-cols-[1fr_1.3fr]">
          <div>
            <SectionLabel n="§02" title="FLAVOR · 味わいの地図" />
            <h2 className="font-serif-display mb-4 text-balance text-[clamp(2rem,4.5vw,2.75rem)] leading-[1.05] tracking-tight">
              4つの軸で、
              <br />
              自分の好みを見える化。
            </h2>
            <p className="mb-6 text-[15px] leading-relaxed text-[var(--ink-2)]">
              総合・酸味・苦味・香り——それぞれ1〜10でスライダー評価。記録が積み上がるほど、テイスティングの地図は輪郭をくっきりさせていきます。
            </p>
            <div className="grid gap-2.5">
              <ScoreBar label="OVERALL" value={exampleProfile.overall} color="var(--rating-overall)" />
              <ScoreBar label="ACIDITY" value={exampleProfile.acidity} color="var(--rating-acidity)" />
              <ScoreBar label="AROMA"   value={exampleProfile.aroma}   color="var(--rating-aroma)" />
              <ScoreBar label="BITTER"  value={exampleProfile.bitter}  color="var(--rating-bitter)" />
            </div>
          </div>
          <div className="grid place-items-center">
            <RadarChart values={exampleProfile} size={400} color="var(--espresso)" />
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section>
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-6 py-16 md:grid-cols-[1.2fr_1fr]">
          <h2 className="font-serif-display text-balance text-[clamp(2.5rem,5vw,4.5rem)] leading-[1] tracking-tight">
            次の一袋は、
            <br />
            <em className="not-italic text-[var(--espresso)] [font-style:italic]">
              どんな香り
            </em>
            だった?
          </h2>
          <div>
            <p className="text-[15px] leading-relaxed text-[var(--ink-2)]">
              飲んだその日の印象を、数分で書き残しておく。明日のあなたが、今日のあなたに感謝する。
            </p>
            <Link
              href="/coffee/new"
              className="mt-5 inline-flex items-center gap-2.5 rounded-full bg-[var(--ink)] px-7 py-4 text-[15px] text-[var(--background)] transition hover:bg-[var(--espresso)]"
            >
              <BeanMark size={18} color="var(--background)" />
              今すぐノートを始める
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
