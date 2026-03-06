import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { CoffeeEvaluation } from '@/lib/types/coffee'
import type { OcrExtractedData } from '@/lib/application/ocr'
import { EvaluationForm } from '../evaluation-form'

const mockCreateCoffeeEvaluation = jest.fn()
const mockUpdateCoffeeEvaluation = jest.fn()

jest.mock('@/lib/actions/coffee', () => ({
  createCoffeeEvaluation: (...args: any[]) => mockCreateCoffeeEvaluation(...args),
  updateCoffeeEvaluation: (...args: any[]) => mockUpdateCoffeeEvaluation(...args),
}))

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: jest.fn(),
    push: jest.fn(),
    replace: jest.fn(),
  }),
}))

const sampleInitialData: CoffeeEvaluation = {
  id: 'eval-123',
  shop_name: 'Blue Bottle',
  bean_type: 'Ethiopia',
  bean_name: 'イルガチェフェ',
  roast_level: 'Medium',
  acidity: 7,
  bitterness: 4,
  aroma: 9,
  overall_rating: 8,
  is_public: true,
  user_id: 'user-1',
  created_at: '2025-01-01T00:00:00.000Z',
  updated_at: '2025-01-02T00:00:00.000Z',
}

const setSliderValue = (label: RegExp, value: number) => {
  fireEvent.change(screen.getByRole('slider', { name: label }), {
    target: { value: value.toString() },
  })
}

describe('EvaluationForm', () => {
  beforeEach(() => {
    mockCreateCoffeeEvaluation.mockReset()
    mockUpdateCoffeeEvaluation.mockReset()
  })

  it('renders create mode with empty inputs and default slider values', () => {
    render(<EvaluationForm />)

    expect(screen.getByLabelText(/店名/i)).toHaveValue('')
    expect(screen.getByLabelText(/豆の産地/i)).toHaveValue('')
    expect(screen.getByLabelText(/豆の名前/i)).toHaveValue('')

    const sliders = screen.getAllByRole('slider')
    expect(sliders).toHaveLength(4)
    expect(sliders.map((slider) => (slider as HTMLInputElement).value)).toEqual([
      '5',
      '5',
      '5',
      '5',
    ])

    expect(screen.getByRole('button', { name: /保存/i })).toBeInTheDocument()
  })

  it('applies OCR prefill when props are updated after initial render', () => {
    const { rerender } = render(<EvaluationForm />)

    const ocrPreFill: OcrExtractedData = {
      bean_name: 'ケニアAA',
      bean_type: 'Kenya',
      roast_level: 'medium',
      shop_name: 'Onibus Coffee',
      shop_address: 'Tokyo',
      acidity: 8,
      aroma: 7,
      bitterness: 4,
      overall_rating: 9,
    }

    rerender(<EvaluationForm ocrPreFill={ocrPreFill} />)

    expect(screen.getByLabelText(/店名/i)).toHaveValue('Onibus Coffee')
    expect(screen.getByLabelText(/豆の産地/i)).toHaveValue('Kenya')
    expect(screen.getByLabelText(/豆の名前/i)).toHaveValue('ケニアAA')
    expect(screen.getByLabelText(/焙煎度/i)).toHaveValue('medium')
    expect(screen.getByRole('slider', { name: /総合評価/i })).toHaveValue('9')
    expect(screen.getByRole('slider', { name: /酸味/i })).toHaveValue('8')
  })

  it('prefills values in edit mode and calls update action on submit', async () => {
    const user = userEvent.setup()
    render(<EvaluationForm initialData={sampleInitialData} />)

    expect(screen.getByLabelText(/店名/i)).toHaveValue(sampleInitialData.shop_name)
    expect(screen.getByRole('slider', { name: /総合評価/i })).toHaveValue(
      sampleInitialData.overall_rating.toString()
    )

    await user.clear(screen.getByLabelText(/店名/i))
    await user.type(screen.getByLabelText(/店名/i), 'Verve Coffee')
    await user.clear(screen.getByLabelText(/豆の名前/i))
    await user.type(screen.getByLabelText(/豆の名前/i), 'ケニアAA')
    setSliderValue(/酸味/i, 6)

    await user.click(screen.getByRole('button', { name: /更新/i }))

    await waitFor(() =>
      expect(mockUpdateCoffeeEvaluation).toHaveBeenCalledWith(
        sampleInitialData.id,
        expect.any(FormData)
      )
    )

    const formData = mockUpdateCoffeeEvaluation.mock.calls[0][1] as FormData
    expect(formData.get('shop_name')).toBe('Verve Coffee')
    expect(formData.get('bean_name')).toBe('ケニアAA')
    expect(formData.get('acidity')).toBe('6')
    expect(mockCreateCoffeeEvaluation).not.toHaveBeenCalled()
  })

  it('submits create action with form values and slider ratings', async () => {
    mockCreateCoffeeEvaluation.mockResolvedValue(undefined)

    const user = userEvent.setup()
    render(<EvaluationForm />)

    await user.type(screen.getByLabelText(/店名/i), 'Onibus Coffee')
    await user.type(screen.getByLabelText(/豆の産地/i), 'Kenya AA')
    await user.type(screen.getByLabelText(/焙煎度/i), 'Light roast')
    await user.type(screen.getByLabelText(/豆の名前/i), 'Kenya AA Top')
    setSliderValue(/総合評価/i, 9)

    // PublicToggle defaults to false (非公開), so we don't need to toggle it
    const visibilityToggle = screen.getByRole('checkbox', { name: /🔒 非公開/i })
    expect(visibilityToggle).not.toBeChecked() // Verify it's unchecked (private)

    await user.click(screen.getByRole('button', { name: /保存/i }))

    await waitFor(() => expect(mockCreateCoffeeEvaluation).toHaveBeenCalledWith(expect.any(FormData)))

    const formData = mockCreateCoffeeEvaluation.mock.calls[0][0] as FormData
    expect(formData.get('shop_name')).toBe('Onibus Coffee')
    expect(formData.get('bean_name')).toBe('Kenya AA Top')
    expect(formData.get('overall_rating')).toBe('9')
    expect(formData.get('is_public')).toBe('false')
  })

  it('blocks submission when required fields are missing and shows validation', async () => {
    const user = userEvent.setup()
    render(<EvaluationForm />)

    await user.click(screen.getByRole('button', { name: /保存/i }))

    expect(await screen.findByText(/豆の名前は必須です/i)).toBeInTheDocument()
    expect(mockCreateCoffeeEvaluation).not.toHaveBeenCalled()
  })

  it('renders server errors returned from actions', async () => {
    mockCreateCoffeeEvaluation.mockResolvedValue({ error: '保存に失敗しました' })

    const user = userEvent.setup()
    render(<EvaluationForm />)

    await user.type(screen.getByLabelText(/豆の名前/i), 'Brazil Santos')
    await user.click(screen.getByRole('button', { name: /保存/i }))

    expect(await screen.findByText(/保存に失敗しました/i)).toBeInTheDocument()
  })

  it('shows a loading state while submitting', async () => {
    let resolveAction: () => void
    mockCreateCoffeeEvaluation.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveAction = resolve
        })
    )

    const user = userEvent.setup()
    render(<EvaluationForm />)

    await user.type(screen.getByLabelText(/豆の名前/i), 'Geisha')
    await user.click(screen.getByRole('button', { name: /保存/i }))

    expect(screen.getByRole('button', { name: /処理中/i })).toBeDisabled()

    resolveAction!()

    await waitFor(() =>
      expect(screen.getByRole('button', { name: /保存/i })).not.toBeDisabled()
    )
  })

  describe('Bean Name Field', () => {
    it('renders bean name input field with correct label and placeholder', () => {
      render(<EvaluationForm />)

      const beanNameInput = screen.getByLabelText(/豆の名前/i)
      expect(beanNameInput).toBeInTheDocument()
      expect(beanNameInput).toHaveAttribute('placeholder', '例: エチオピア イルガチェフェ G1')
      expect(beanNameInput).toHaveValue('')
    })

    it('initializes beanName state from initialData in edit mode', () => {
      const dataWithBeanName: CoffeeEvaluation = {
        ...sampleInitialData,
        bean_name: 'エチオピア イルガチェフェ G1',
      }
      render(<EvaluationForm initialData={dataWithBeanName} />)

      const beanNameInput = screen.getByLabelText(/豆の名前/i)
      expect(beanNameInput).toHaveValue('エチオピア イルガチェフェ G1')
    })

    it('includes bean_name in FormData when creating new evaluation', async () => {
      mockCreateCoffeeEvaluation.mockResolvedValue(undefined)

      const user = userEvent.setup()
      render(<EvaluationForm />)

      await user.type(screen.getByLabelText(/店名/i), 'Test Cafe')
    await user.type(screen.getByLabelText(/豆の産地/i), 'エチオピア')
      await user.type(screen.getByLabelText(/豆の名前/i), 'エチオピア イルガチェフェ G1')
      await user.click(screen.getByRole('button', { name: /保存/i }))

      await waitFor(() => expect(mockCreateCoffeeEvaluation).toHaveBeenCalledWith(expect.any(FormData)))

      const formData = mockCreateCoffeeEvaluation.mock.calls[0][0] as FormData
      expect(formData.get('bean_name')).toBe('エチオピア イルガチェフェ G1')
    })

    it('includes bean_name in FormData when updating existing evaluation', async () => {
      mockUpdateCoffeeEvaluation.mockResolvedValue(undefined)

      const dataWithBeanName: CoffeeEvaluation = {
        ...sampleInitialData,
        bean_name: 'グアテマラ アンティグア',
      }

      const user = userEvent.setup()
      render(<EvaluationForm initialData={dataWithBeanName} />)

      const beanNameInput = screen.getByLabelText(/豆の名前/i)
      await user.clear(beanNameInput)
      await user.type(beanNameInput, 'コロンビア スプレモ')
      await user.click(screen.getByRole('button', { name: /更新/i }))

      await waitFor(() =>
        expect(mockUpdateCoffeeEvaluation).toHaveBeenCalledWith(
          sampleInitialData.id,
          expect.any(FormData)
        )
      )

      const formData = mockUpdateCoffeeEvaluation.mock.calls[0][1] as FormData
      expect(formData.get('bean_name')).toBe('コロンビア スプレモ')
    })
  })

  describe('PublicToggle Integration', () => {
    it('renders PublicToggle component with default unchecked state', () => {
      render(<EvaluationForm />)

      // Verify PublicToggle component is rendered
      const publicToggle = screen.getByTestId('public-toggle')
      expect(publicToggle).toBeInTheDocument()

      // Verify checkbox is unchecked by default with "非公開" label
      const checkbox = screen.getByRole('checkbox', { name: /🔒 非公開/i })
      expect(checkbox).not.toBeChecked()
      expect(screen.getByText(/🔒 非公開/i)).toBeInTheDocument()
    })

    it('renders PublicToggle with checked state when initialData.is_public is true', () => {
      render(<EvaluationForm initialData={sampleInitialData} />)

      // Verify PublicToggle is rendered and checked with "公開" label
      const checkbox = screen.getByRole('checkbox', { name: /🌐 公開/i })
      expect(checkbox).toBeChecked()
      expect(screen.getByText(/🌐 公開/i)).toBeInTheDocument()
    })

    it('toggles PublicToggle and updates label dynamically', async () => {
      const user = userEvent.setup()
      render(<EvaluationForm />)

      // Initially unchecked with "非公開" label
      let checkbox = screen.getByRole('checkbox', { name: /🔒 非公開/i })
      expect(checkbox).not.toBeChecked()
      expect(screen.getByText(/🔒 非公開/i)).toBeInTheDocument()

      // Click to make public - label should change to "公開"
      await user.click(checkbox)
      checkbox = screen.getByRole('checkbox', { name: /🌐 公開/i })
      expect(checkbox).toBeChecked()
      expect(screen.getByText(/🌐 公開/i)).toBeInTheDocument()

      // Click again to make private - label should change back to "非公開"
      await user.click(checkbox)
      checkbox = screen.getByRole('checkbox', { name: /🔒 非公開/i })
      expect(checkbox).not.toBeChecked()
      expect(screen.getByText(/🔒 非公開/i)).toBeInTheDocument()
    })

    it('includes PublicToggle value in form submission (create mode)', async () => {
      mockCreateCoffeeEvaluation.mockResolvedValue(undefined)

      const user = userEvent.setup()
    render(<EvaluationForm />)

    // Fill required fields
    await user.type(screen.getByLabelText(/店名/i), 'Test Cafe')
    await user.type(screen.getByLabelText(/豆の産地/i), 'Test Bean')
    await user.type(screen.getByLabelText(/豆の名前/i), 'Test Bean Name')

      // Toggle public to true
      const checkbox = screen.getByRole('checkbox', { name: /🔒 非公開/i })
      await user.click(checkbox)
      expect(screen.getByRole('checkbox', { name: /🌐 公開/i })).toBeChecked()

      // Submit form
      await user.click(screen.getByRole('button', { name: /保存/i }))

      await waitFor(() =>
        expect(mockCreateCoffeeEvaluation).toHaveBeenCalledWith(expect.any(FormData))
      )

      // Verify is_public is true in FormData
      const formData = mockCreateCoffeeEvaluation.mock.calls[0][0] as FormData
      expect(formData.get('is_public')).toBe('true')
    })

    it('includes PublicToggle value in form submission (edit mode)', async () => {
      mockUpdateCoffeeEvaluation.mockResolvedValue(undefined)

      const user = userEvent.setup()
      // initialData has is_public: true
      render(<EvaluationForm initialData={sampleInitialData} />)

      // Verify checkbox is initially checked with "公開" label
      const checkbox = screen.getByRole('checkbox', { name: /🌐 公開/i })
      expect(checkbox).toBeChecked()

      // Toggle to private
      await user.click(checkbox)
      expect(screen.getByRole('checkbox', { name: /🔒 非公開/i })).not.toBeChecked()

      // Submit form
      await user.click(screen.getByRole('button', { name: /更新/i }))

      await waitFor(() =>
        expect(mockUpdateCoffeeEvaluation).toHaveBeenCalledWith(
          sampleInitialData.id,
          expect.any(FormData)
        )
      )

      // Verify is_public is false in FormData
      const formData = mockUpdateCoffeeEvaluation.mock.calls[0][1] as FormData
      expect(formData.get('is_public')).toBe('false')
    })

    it('displays PublicToggle with dynamic emoji label based on initial state', () => {
      // When no initialData (create mode), defaults to false and shows "非公開"
      const { unmount } = render(<EvaluationForm />)
      expect(screen.getByText(/🔒 非公開/i)).toBeInTheDocument()
      unmount()

      // When initialData.is_public is true (edit mode), shows "公開"
      render(<EvaluationForm initialData={sampleInitialData} />)
      expect(screen.getByText(/🌐 公開/i)).toBeInTheDocument()
    })
  })
})
