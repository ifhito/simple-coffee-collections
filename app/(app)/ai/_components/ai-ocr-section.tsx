import type { useAiOcrController } from './use-ai-ocr-controller'

type AiOcrState = ReturnType<typeof useAiOcrController>

type Props = {
  ocr: AiOcrState
}

export function AiOcrSection({ ocr }: Props) {
  return (
    <section className="rounded-sm border border-[var(--rule)] bg-[var(--paper)] p-6">
      <h2 className="mb-1 text-lg font-semibold text-[var(--ink)]">AI画像分析</h2>
      <p className="mb-4 text-sm text-[var(--ink-3)]">
        コーヒーパッケージの画像を解析して、フォームへ自動入力します。
      </p>

      <div
        className={`mb-4 flex flex-col items-center justify-center rounded-sm border-2 border-dashed border-[var(--rule)] bg-[var(--background-2)] p-8 transition ${
          ocr.isAnalyzing
            ? 'cursor-not-allowed opacity-60'
            : 'cursor-pointer hover:border-[var(--espresso)] hover:bg-[var(--background-2)]'
        }`}
        role="button"
        tabIndex={ocr.isAnalyzing ? -1 : 0}
        aria-disabled={ocr.isAnalyzing}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          if (ocr.isAnalyzing) return
          const file = e.dataTransfer.files[0] ?? null
          ocr.handleFileChange(file)
        }}
        onClick={ocr.openFilePicker}
        onKeyDown={(e) => {
          if (ocr.isAnalyzing) return
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            ocr.openFilePicker()
          }
        }}
      >
        {ocr.previewUrl && !ocr.previewLoadFailed ? (
          <img
            src={ocr.previewUrl}
            alt="プレビュー"
            className="max-h-48 max-w-full rounded-sm object-contain"
            onError={ocr.handlePreviewError}
          />
        ) : ocr.selectedFile ? (
          <div className="flex flex-col items-center gap-2 text-center">
            <p className="text-sm font-medium text-[var(--ink-2)]">画像を選択しました</p>
            <p className="max-w-full break-all text-xs text-[var(--ink-3)]">{ocr.selectedFile.name}</p>
            <p className="text-xs text-[var(--ink-3)]">
              このブラウザではプレビューできない形式ですが、解析は実行できます。
            </p>
          </div>
        ) : (
          <>
            <svg
              className="mb-2 h-10 w-10 text-[var(--ink-3)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="text-sm text-[var(--ink-3)]">画像をドロップ、またはクリックして選択</p>
            <p className="mt-1 text-xs text-[var(--ink-3)]">JPEG / PNG / WEBP / HEIC 対応</p>
          </>
        )}
        <input
          ref={ocr.fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => ocr.handleFileChange(e.target.files?.[0] ?? null)}
          disabled={ocr.isAnalyzing}
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={ocr.handleAnalyze}
          disabled={ocr.isAnalyzeDisabled}
          className="rounded-sm border border-[var(--rule)] bg-[var(--paper)] px-4 py-2 text-sm font-medium text-[var(--ink-2)] transition hover:border-[var(--ink)] disabled:opacity-50"
        >
          {ocr.isAnalyzing ? '解析中...' : '解析する'}
        </button>
      </div>

      {ocr.ocrError && (
        <p className="mt-3 text-sm text-red-600" role="alert">
          {ocr.ocrError}
        </p>
      )}
    </section>
  )
}
