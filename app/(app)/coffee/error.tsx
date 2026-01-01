'use client'

export default function CoffeeListError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-8">
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 shadow-sm">
        <h1 className="text-lg font-semibold text-red-700">読み込みに失敗しました</h1>
        <p className="mt-2 text-sm text-red-600">
          コーヒー評価一覧の読み込み中にエラーが発生しました。時間をおいて再度お試しください。
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
          <a
            href="/"
            className="rounded-md border border-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-100"
          >
            トップへ戻る
          </a>
        </div>
      </div>
    </section>
  )
}
