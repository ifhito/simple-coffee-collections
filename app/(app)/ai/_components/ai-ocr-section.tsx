import type { useAiOcrController } from './use-ai-ocr-controller'

type AiOcrState = ReturnType<typeof useAiOcrController>

type Props = {
  ocr: AiOcrState
}

export function AiOcrSection({ ocr }: Props) {
  return (
    <section className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
      <h2 className="mb-1 text-lg font-semibold text-neutral-900">AI画像分析</h2>
      <p className="mb-4 text-sm text-neutral-500">
        コーヒーパッケージの画像を解析して、フォームへ自動入力します。
      </p>

      <div
        className={`mb-4 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-neutral-300 bg-neutral-50 p-8 transition ${
          ocr.isAnalyzing
            ? 'cursor-not-allowed opacity-60'
            : 'cursor-pointer hover:border-amber-400 hover:bg-amber-50/40'
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
            className="max-h-48 max-w-full rounded-md object-contain"
            onError={ocr.handlePreviewError}
          />
        ) : ocr.selectedFile ? (
          <div className="flex flex-col items-center gap-2 text-center">
            <p className="text-sm font-medium text-neutral-700">画像を選択しました</p>
            <p className="max-w-full break-all text-xs text-neutral-500">{ocr.selectedFile.name}</p>
            <p className="text-xs text-neutral-400">
              このブラウザではプレビューできない形式ですが、解析は実行できます。
            </p>
          </div>
        ) : (
          <>
            <svg
              className="mb-2 h-10 w-10 text-neutral-400"
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
            <p className="text-sm text-neutral-500">画像をドロップ、またはクリックして選択</p>
            <p className="mt-1 text-xs text-neutral-400">JPEG / PNG / WEBP / HEIC 対応</p>
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
          className="rounded-md bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:opacity-50"
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
