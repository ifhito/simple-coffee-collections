import type { useBeanRecommendationController } from './use-bean-recommendation-controller'

type BeanRecommendationState = ReturnType<typeof useBeanRecommendationController>

type Props = {
  recommendation: BeanRecommendationState
}

const confidenceLabel = {
  high: '自信あり',
  medium: 'そこそこ',
  low: '参考程度',
} as const

function formatBeanMeta(input: {
  beanType: string | null
  roastLevel: string | null
  shopName: string | null
}): string {
  return [input.beanType, input.roastLevel, input.shopName].filter(Boolean).join(' / ')
}

export function AiBeanRecommendationSection({ recommendation }: Props) {
  return (
    <section className="rounded-sm border border-[var(--rule)] bg-[var(--paper)] p-6">
      <div className="mb-4 space-y-1">
        <p className="font-mono-caps text-[11px] text-[var(--espresso)]">Recommend</p>
        <h2 className="text-lg font-semibold text-[var(--ink)]">友達向け豆推薦</h2>
        <p className="text-sm text-[var(--ink-3)]">
          友達の好みを入力すると、自分が飲んだ評価済みの豆から紹介しやすい候補を選びます。
        </p>
      </div>

      <div className="space-y-4">
        <label className="block space-y-2">
          <span className="text-sm font-medium text-[var(--ink-2)]">友達の好み</span>
          <textarea
            value={recommendation.friendPreferenceText}
            onChange={(event) => recommendation.setFriendPreferenceText(event.target.value)}
            rows={4}
            maxLength={1000}
            placeholder="例: 苦味は控えめで、フルーティーで飲みやすい豆が好きそう"
            className="w-full rounded-sm border border-[var(--rule)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--ink)] outline-none transition placeholder:text-[var(--ink-3)] focus:border-[var(--espresso)]"
          />
        </label>

        <label className="block max-w-32 space-y-2">
          <span className="text-sm font-medium text-[var(--ink-2)]">件数</span>
          <select
            value={recommendation.limit}
            onChange={(event) => recommendation.setLimit(Number(event.target.value))}
            className="w-full rounded-sm border border-[var(--rule)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--ink)] outline-none focus:border-[var(--espresso)]"
          >
            {[1, 2, 3, 4, 5].map((value) => (
              <option key={value} value={value}>
                {value}件
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          onClick={recommendation.handleRecommend}
          disabled={recommendation.isRecommendDisabled}
          className="rounded-sm border border-[var(--rule)] bg-[var(--paper)] px-4 py-2 text-sm font-medium text-[var(--ink-2)] transition hover:border-[var(--ink)] disabled:opacity-50"
        >
          {recommendation.isRecommending ? '生成中...' : 'おすすめを作る'}
        </button>
      </div>

      {recommendation.error && (
        <p className="mt-3 text-sm text-red-600" role="alert">
          {recommendation.error}
        </p>
      )}

      {recommendation.result && (
        <div className="mt-6 space-y-4">
          <p className="rounded-sm bg-[var(--background-2)] p-3 text-sm text-[var(--ink-2)]">
            {recommendation.result.summary}
          </p>

          {recommendation.result.recommendations.length === 0 ? (
            <p className="text-sm text-[var(--ink-3)]">表示できるおすすめはありません。</p>
          ) : (
            <div className="space-y-3">
              {recommendation.result.recommendations.map((item) => (
                <article
                  key={item.evaluationId}
                  className="rounded-sm border border-[var(--rule)] bg-[var(--background)] p-4"
                >
                  <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h3 className="font-medium text-[var(--ink)]">{item.beanName}</h3>
                      {formatBeanMeta(item) && (
                        <p className="mt-1 text-xs text-[var(--ink-3)]">{formatBeanMeta(item)}</p>
                      )}
                    </div>
                    <span className="rounded-full bg-[var(--background-2)] px-2 py-1 text-xs text-[var(--ink-3)]">
                      {confidenceLabel[item.confidence]}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm text-[var(--ink-2)]">
                    <p>
                      <span className="font-medium text-[var(--ink)]">理由: </span>
                      {item.reason}
                    </p>
                    <p>
                      <span className="font-medium text-[var(--ink)]">伝え方: </span>
                      {item.howToRecommend}
                    </p>
                    {item.caution && (
                      <p className="text-[var(--ink-3)]">
                        <span className="font-medium">注意: </span>
                        {item.caution}
                      </p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  )
}
