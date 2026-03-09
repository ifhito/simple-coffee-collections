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
  const cameraInput = inputs.find((input) => input.getAttribute('capture') === 'environment')
  const fileInput = inputs.find((input) => !input.hasAttribute('capture'))

  if (!cameraInput || !fileInput) {
    throw new Error('camera/file input not found')
  }

  return { cameraInput, fileInput }
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

  it('renders both camera and file selection buttons', () => {
    render(<AiFeaturesClient initialSettings={null} />)

    expect(screen.getByRole('button', { name: 'カメラ起動' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'ファイル選択' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'ファイルを選択' })).not.toBeInTheDocument()
  })

  it('opens the expected picker from each button', async () => {
    const user = userEvent.setup()
    const { container } = render(<AiFeaturesClient initialSettings={null} />)
    const { cameraInput, fileInput } = getInputs(container)
    const cameraClick = jest.fn()
    const fileClick = jest.fn()
    Object.defineProperty(cameraInput, 'click', { value: cameraClick })
    Object.defineProperty(fileInput, 'click', { value: fileClick })

    await user.click(screen.getByRole('button', { name: 'カメラ起動' }))
    await user.click(screen.getByRole('button', { name: 'ファイル選択' }))

    expect(cameraClick).toHaveBeenCalledTimes(1)
    expect(fileClick).toHaveBeenCalledTimes(1)
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
      expect(screen.getByRole('button', { name: 'カメラ起動' })).toBeDisabled()
      expect(screen.getByRole('button', { name: 'ファイル選択' })).toBeDisabled()
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
})
