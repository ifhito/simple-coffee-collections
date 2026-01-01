'use client'

import Link from 'next/link'

export default function CoffeeDetailError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-8">
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 shadow-sm">
        <h1 className="text-lg font-semibold text-red-700">評価の読み込みに失敗しました</h1>
        <p className="mt-2 text-sm text-red-600">
          詳細ページの読み込み中にエラーが発生しました。ネットワーク環境を確認し、再度お試しください。
        </p>
        <p className="mt-2 text-xs text-red-500 break-words">{error.message}</p>
        <div className="mt-4 flex gap-3">
          <button
            type="button"
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
            onClick={reset}
          >
            再試行する
          </button>
          <Link
            href="/coffee"
            className="rounded-md border border-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-100"
          >
            一覧へ戻る
          </Link>
        </div>
      </div>
    </section>
  )
}
