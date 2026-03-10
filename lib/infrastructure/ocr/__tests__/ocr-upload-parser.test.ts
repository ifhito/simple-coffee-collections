import { parseOcrUpload } from '../ocr-upload-parser'

jest.mock('../heic-converter', () => ({
  convertHeicToJpeg: jest.fn(),
}))

import { convertHeicToJpeg } from '../heic-converter'

const mockConvertHeicToJpeg = convertHeicToJpeg as jest.MockedFunction<typeof convertHeicToJpeg>

function makeFile(name: string, type: string, content = 'data'): File {
  const file = new File([content], name, { type })
  if (typeof file.arrayBuffer !== 'function') {
    Object.defineProperty(file, 'arrayBuffer', {
      value: async () => new Uint8Array([1]).buffer,
    })
  }
  return file
}

function makeFormData(entries: Record<string, unknown>): FormData {
  return {
    get: (key: string) => entries[key] ?? null,
  } as unknown as FormData
}

describe('parseOcrUpload', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns error when image file is missing', async () => {
    const formData = makeFormData({})
    const result = await parseOcrUpload(formData)

    expect(result).toEqual({
      ok: false,
      status: 400,
      error: '画像ファイルが必要です',
    })
  })

  it('returns error for unsupported mime type', async () => {
    const formData = makeFormData({
      image: makeFile('manual.pdf', 'application/pdf', 'pdf'),
    })

    const result = await parseOcrUpload(formData)
    expect(result).toEqual({
      ok: false,
      status: 400,
      error: '未対応の画像形式です。JPEG/PNG/WEBP/HEIC/HEIF形式を使用してください。',
    })
  })

  it('converts HEIC file to JPEG via converter', async () => {
    const formData = makeFormData({
      image: makeFile('coffee.heic', 'image/heic', 'heic-bytes'),
      inline_provider_template: 'gemini',
      inline_model_name: 'gemini-2.0-flash',
      inline_api_key: 'AIza-test',
    })
    mockConvertHeicToJpeg.mockResolvedValue(Buffer.from('jpeg-bytes'))

    const result = await parseOcrUpload(formData)

    expect(mockConvertHeicToJpeg).toHaveBeenCalled()
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value.mimeType).toBe('image/jpeg')
      expect(result.value.inlineProviderTemplate).toBe('gemini')
      expect(result.value.inlineModelName).toBe('gemini-2.0-flash')
      expect(result.value.inlineApiKey).toBe('AIza-test')
      expect(result.value.imageBuffer.equals(Buffer.from('jpeg-bytes'))).toBe(true)
    }
  })

  it('returns conversion error when HEIC conversion fails', async () => {
    const formData = makeFormData({
      image: makeFile('coffee.heic', 'image/heic', 'heic-bytes'),
    })
    mockConvertHeicToJpeg.mockResolvedValue(null)

    const result = await parseOcrUpload(formData)

    expect(result).toEqual({
      ok: false,
      status: 400,
      error: 'HEIC/HEIF画像の変換に失敗しました。JPEG/PNG/WEBP形式で再試行してください。',
    })
  })
})
