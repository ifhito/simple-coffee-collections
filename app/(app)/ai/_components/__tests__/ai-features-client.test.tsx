import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AiFeaturesClient } from '../ai-features-client'

const mockPush = jest.fn()
const mockSaveLlmSettings = jest.fn()
const mockDeleteLlmSettings = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: jest.fn(),
    push: mockPush,
    replace: jest.fn(),
  }),
}))

jest.mock('@/lib/actions/llm-settings', () => ({
  saveLlmSettings: (...args: unknown[]) => mockSaveLlmSettings(...args),
  deleteLlmSettings: (...args: unknown[]) => mockDeleteLlmSettings(...args),
}))

jest.mock('../llm-settings-panel', () => ({
  LlmSettingsPanel: () => <div data-testid="llm-settings-panel" />,
}))

function getInputs(container: HTMLElement) {
  const inputs = Array.from(container.querySelectorAll<HTMLInputElement>('input[type="file"]'))
  const fileInput = inputs[0]
  if (!fileInput) throw new Error('file input not found')
  return { fileInput, inputCount: inputs.length }
}

describe('AiFeaturesClient', () => {
  beforeEach(() => {
    mockPush.mockReset()
    mockSaveLlmSettings.mockReset()
    mockDeleteLlmSettings.mockReset()
    global.fetch = jest.fn() as unknown as typeof fetch
    Object.defineProperty(URL, 'createObjectURL', {
      writable: true,
      value: jest.fn(() => 'blob:mock-preview'),
    })
    Object.defineProperty(URL, 'revokeObjectURL', {
      writable: true,
      value: jest.fn(),
    })
  })

  afterEach(() => {
    jest.resetModules()
  })

  it('does not render camera/file selection buttons', () => {
    render(<AiFeaturesClient initialSettings={null} />)

    expect(screen.queryByRole('button', { name: 'カメラ起動' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'ファイル選択' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'ファイルを選択' })).not.toBeInTheDocument()
  })

  it('renders only one file input', () => {
    const { container } = render(<AiFeaturesClient initialSettings={null} />)
    const { inputCount } = getInputs(container)
    expect(inputCount).toBe(1)
  })

  it('opens file picker when drop area is clicked', async () => {
    const user = userEvent.setup()
    const { container } = render(<AiFeaturesClient initialSettings={null} />)
    const { fileInput } = getInputs(container)
    const fileClick = jest.fn()
    Object.defineProperty(fileInput, 'click', { value: fileClick })

    const dropZone = screen.getByRole('button', { name: /画像をドロップ、またはクリックして選択/i })
    await user.click(dropZone)

    expect(fileClick).toHaveBeenCalledTimes(1)
  })

  it('shows full-screen loading overlay and disables pickers while analyzing', async () => {
    const user = userEvent.setup()
    let resolveFetch: ((value: Response) => void) | undefined
    ;(global.fetch as jest.Mock).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveFetch = resolve
        })
    )

    const { container } = render(<AiFeaturesClient initialSettings={null} />)
    const { fileInput } = getInputs(container)

    fireEvent.change(fileInput, {
      target: { files: [new File(['coffee'], 'coffee.jpg', { type: 'image/jpeg' })] },
    })

    await user.click(screen.getByRole('button', { name: '解析する' }))

    await waitFor(() => {
      const dropZone = container.querySelector('div[role="button"]')
      expect(dropZone).toHaveAttribute('aria-disabled', 'true')
      expect(screen.getByText('画像を解析中...')).toBeInTheDocument()
    })

    const overlay = screen.getByText('画像を解析中...').closest('div.fixed')
    expect(overlay).toHaveClass('fixed', 'inset-0', 'w-screen', 'min-h-screen', 'z-[200]')

    resolveFetch?.({
      ok: true,
      json: async () => ({ data: { bean_name: 'Kenya Blend' } }),
    } as Response)

    await waitFor(() =>
      expect(mockPush).toHaveBeenCalledWith('/coffee/new?bean_name=Kenya+Blend')
    )
  })

  it('shows fallback message when preview rendering fails', async () => {
    const { container } = render(<AiFeaturesClient initialSettings={null} />)
    const { fileInput } = getInputs(container)

    fireEvent.change(fileInput, {
      target: { files: [new File(['heic'], 'sample.heic', { type: 'image/heic' })] },
    })

    const previewImage = await screen.findByAltText('プレビュー')
    fireEvent.error(previewImage)

    expect(await screen.findByText('画像を選択しました')).toBeInTheDocument()
    expect(screen.getByText('sample.heic')).toBeInTheDocument()
    expect(
      screen.getByText('このブラウザではプレビューできない形式ですが、解析は実行できます。')
    ).toBeInTheDocument()
  })

  it('uploads HEIC file as-is for server-side conversion', async () => {
    const user = userEvent.setup()
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ data: { bean_name: 'Server Converted Bean' } }),
    } as Response)

    const { container } = render(<AiFeaturesClient initialSettings={null} />)
    const { fileInput } = getInputs(container)

    fireEvent.change(fileInput, {
      target: { files: [new File(['heic-data'], 'from-phone.heic', { type: 'image/heic' })] },
    })

    await user.click(screen.getByRole('button', { name: '解析する' }))

    await waitFor(() => expect(global.fetch).toHaveBeenCalled())

    const [, requestInit] = (global.fetch as jest.Mock).mock.calls[0]
    const body = requestInit.body as FormData
    const uploaded = body.get('image')

    expect(uploaded).toBeInstanceOf(File)
    const uploadedFile = uploaded as File
    expect(uploadedFile.name).toBe('from-phone.heic')
    expect(uploadedFile.type).toBe('image/heic')
  })

  it('renders friend bean recommendation feature and submits preferences', async () => {
    const user = userEvent.setup()
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          summary: '苦味控えめでフルーティーな豆を選びました。',
          recommendations: [
            {
              evaluationId: 'bean-1',
              beanName: 'Ethiopia Natural',
              beanType: 'エチオピア',
              roastLevel: '浅煎り',
              shopName: 'Coffee Shop',
              reason: '香りが華やかで苦味が控えめです。',
              howToRecommend: '果実感があって飲みやすいよ、と伝える。',
              caution: null,
              confidence: 'high',
            },
          ],
        },
      }),
    } as Response)

    render(<AiFeaturesClient initialSettings={null} />)

    expect(screen.getByRole('heading', { name: '友達向け豆推薦' })).toBeInTheDocument()

    await user.type(
      screen.getByLabelText('友達の好み'),
      '苦味控えめでフルーティーな豆が好きそう'
    )
    await user.click(screen.getByRole('button', { name: 'おすすめを作る' }))

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/agent/bean-recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          friendPreferenceText: '苦味控えめでフルーティーな豆が好きそう',
          limit: 3,
        }),
      })
    })
    expect(await screen.findByText('苦味控えめでフルーティーな豆を選びました。')).toBeInTheDocument()
    expect(screen.getByText('Ethiopia Natural')).toBeInTheDocument()
    expect(screen.getByText('香りが華やかで苦味が控えめです。')).toBeInTheDocument()
    expect(screen.getByText('果実感があって飲みやすいよ、と伝える。')).toBeInTheDocument()
  })

  it('shows friend recommendation API errors', async () => {
    const user = userEvent.setup()
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'LLM設定が未設定です。プロフィールのAI設定からAPIキーを設定してください。' }),
    } as Response)

    render(<AiFeaturesClient initialSettings={null} />)

    await user.type(screen.getByLabelText('友達の好み'), 'おすすめある？')
    await user.click(screen.getByRole('button', { name: 'おすすめを作る' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('LLM設定が未設定です')
  })

})
