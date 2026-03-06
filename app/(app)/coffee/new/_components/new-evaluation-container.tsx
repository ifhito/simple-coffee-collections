'use client'

import { useState } from 'react'
import { EvaluationForm } from '../../_components/evaluation-form'
import { OcrUploadModal } from '../../_components/ocr/ocr-upload-modal'
import type { OcrExtractedData } from '@/lib/application/ocr'

type OcrModalState =
  | { status: 'closed' }
  | { status: 'uploading' }
  | { status: 'analyzing' }

export function NewEvaluationContainer() {
  const [modal, setModal] = useState<OcrModalState>({ status: 'closed' })
  const [ocrData, setOcrData] = useState<OcrExtractedData | null>(null)

  function handleOcrComplete(data: OcrExtractedData) {
    setOcrData(data)
    setModal({ status: 'closed' })
  }

  function openModal() {
    setModal({ status: 'uploading' })
  }

  function closeModal() {
    setModal({ status: 'closed' })
  }

  function handleAnalyzeStateChange(isAnalyzing: boolean) {
    setModal((current) => {
      if (current.status === 'closed') return current
      return { status: isAnalyzing ? 'analyzing' : 'uploading' }
    })
  }

  return (
    <>
      {/* OCR trigger button */}
      <div className="mb-4">
        <button
          type="button"
          onClick={openModal}
          className="inline-flex items-center gap-2 rounded-md border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700 transition hover:bg-amber-100"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          画像から入力する
        </button>
        {ocrData && (
          <span className="ml-3 text-xs text-green-600">✓ AI解析結果を反映済み（確認・修正してから保存してください）</span>
        )}
      </div>

      {/* OCR Upload Modal */}
      {modal.status !== 'closed' && (
        <OcrUploadModal
          state={modal.status === 'analyzing' ? { status: 'analyzing' } : { status: 'uploading' }}
          onAnalyzeStateChange={handleAnalyzeStateChange}
          onComplete={handleOcrComplete}
          onClose={closeModal}
        />
      )}

      {/* Evaluation form - pre-filled with OCR data when available */}
      <EvaluationForm ocrPreFill={ocrData ?? undefined} />
    </>
  )
}
