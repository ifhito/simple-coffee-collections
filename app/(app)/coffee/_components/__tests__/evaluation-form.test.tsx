import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { EvaluationFormDefaultValues } from '../evaluation-form'
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

const sampleDefaultValues: EvaluationFormDefaultValues = {
  shop_name: 'Blue Bottle',
  bean_type: 'Ethiopia',
  bean_name: 'イルガチェフェ',
  roast_level: 'Medium',
  notes: '柑橘っぽい余韻',
  acidity: 7,
  bitterness: 4,
  aroma: 9,
  overall_rating: 8,
  is_public: true,
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

  it('prefills text fields from defaultValues (e.g. OCR result)', () => {
    const ocrDefaultValues: EvaluationFormDefaultValues = {
      bean_name: 'ケニアAA',
      bean_type: 'Kenya',
      roast_level: 'medium',
      shop_name: 'Onibus Coffee',
    }

    render(<EvaluationForm defaultValues={ocrDefaultValues} />)

    expect(screen.getByLabelText(/店名/i)).toHaveValue('Onibus Coffee')
    expect(screen.getByLabelText(/豆の産地/i)).toHaveValue('Kenya')
    expect(screen.getByLabelText(/豆の名前/i)).toHaveValue('ケニアAA')
    expect(screen.getByLabelText(/焙煎度/i)).toHaveValue('medium')
    expect(screen.getByLabelText(/感想/i)).toHaveValue('')
  })

  it('uses default rating values of 5 when defaultValues has no ratings', () => {
    const ocrDefaultValues: EvaluationFormDefaultValues = {
      bean_name: 'ケニアAA',
      shop_name: 'Onibus Coffee',
    }

    render(<EvaluationForm defaultValues={ocrDefaultValues} />)

    expect(screen.getByRole('slider', { name: /総合評価/i })).toHaveValue('5')
    expect(screen.getByRole('slider', { name: /酸味/i })).toHaveValue('5')
  })

  it('prefills values in edit mode and calls update action on submit', async () => {
    const user = userEvent.setup()
    render(<EvaluationForm id="eval-123" defaultValues={sampleDefaultValues} />)

    expect(screen.getByLabelText(/店名/i)).toHaveValue(sampleDefaultValues.shop_name)
    expect(screen.getByRole('slider', { name: /総合評価/i })).toHaveValue(
      sampleDefaultValues.overall_rating!.toString()
    )

    await user.clear(screen.getByLabelText(/店名/i))
    await user.type(screen.getByLabelText(/店名/i), 'Verve Coffee')
    await user.clear(screen.getByLabelText(/豆の名前/i))
    await user.type(screen.getByLabelText(/豆の名前/i), 'ケニアAA')
    setSliderValue(/酸味/i, 6)

    await user.click(screen.getByRole('button', { name: /更新/i }))

    await waitFor(() =>
      expect(mockUpdateCoffeeEvaluation).toHaveBeenCalledWith(
        'eval-123',
        expect.any(FormData)
      )
    )

    const formData = mockUpdateCoffeeEvaluation.mock.calls[0][1] as FormData
    expect(formData.get('shop_name')).toBe('Verve Coffee')
    expect(formData.get('bean_name')).toBe('ケニアAA')
    expect(formData.get('notes')).toBe(sampleDefaultValues.notes)
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
    await user.type(screen.getByLabelText(/感想/i), '冷めても甘さが残る')
    setSliderValue(/総合評価/i, 9)

    // PublicToggle defaults to false (非公開), so we don't need to toggle it
    const visibilityToggle = screen.getByRole('checkbox', { name: /🔒 非公開/i })
    expect(visibilityToggle).not.toBeChecked() // Verify it's unchecked (private)

    await user.click(screen.getByRole('button', { name: /保存/i }))

    await waitFor(() => expect(mockCreateCoffeeEvaluation).toHaveBeenCalledWith(expect.any(FormData)))

    const formData = mockCreateCoffeeEvaluation.mock.calls[0][0] as FormData
    expect(formData.get('shop_name')).toBe('Onibus Coffee')
    expect(formData.get('bean_name')).toBe('Kenya AA Top')
    expect(formData.get('notes')).toBe('冷めても甘さが残る')
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

  it('blocks submission when notes exceed 500 characters', async () => {
    const user = userEvent.setup()
    render(<EvaluationForm />)

    await user.type(screen.getByLabelText(/豆の名前/i), 'Brazil Santos')
    await user.type(screen.getByLabelText(/感想/i), 'a'.repeat(501))
    await user.click(screen.getByRole('button', { name: /保存/i }))

    expect(await screen.findByText(/感想は500文字以内で入力してください/i)).toBeInTheDocument()
    expect(mockCreateCoffeeEvaluation).not.toHaveBeenCalled()
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

    it('initializes beanName state from defaultValues in edit mode', () => {
      render(<EvaluationForm id="eval-123" defaultValues={{ ...sampleDefaultValues, bean_name: 'エチオピア イルガチェフェ G1' }} />)

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

      const user = userEvent.setup()
      render(<EvaluationForm id="eval-123" defaultValues={{ ...sampleDefaultValues, bean_name: 'グアテマラ アンティグア' }} />)

      const beanNameInput = screen.getByLabelText(/豆の名前/i)
      await user.clear(beanNameInput)
      await user.type(beanNameInput, 'コロンビア スプレモ')
      await user.click(screen.getByRole('button', { name: /更新/i }))

      await waitFor(() =>
        expect(mockUpdateCoffeeEvaluation).toHaveBeenCalledWith(
          'eval-123',
          expect.any(FormData)
        )
      )

      const formData = mockUpdateCoffeeEvaluation.mock.calls[0][1] as FormData
      expect(formData.get('bean_name')).toBe('コロンビア スプレモ')
    })
  })

  describe('Notes Field', () => {
    it('initializes notes from defaultValues in edit mode', () => {
      render(<EvaluationForm id="eval-123" defaultValues={sampleDefaultValues} />)

      expect(screen.getByLabelText(/感想/i)).toHaveValue(sampleDefaultValues.notes)
      expect(
        screen.getByText(`${sampleDefaultValues.notes!.trim().length}/500`)
      ).toBeInTheDocument()
    })

    it('submits empty notes as an empty string', async () => {
      mockCreateCoffeeEvaluation.mockResolvedValue(undefined)

      const user = userEvent.setup()
      render(<EvaluationForm />)

      await user.type(screen.getByLabelText(/豆の名前/i), 'Geisha')
      await user.click(screen.getByRole('button', { name: /保存/i }))

      await waitFor(() => expect(mockCreateCoffeeEvaluation).toHaveBeenCalledWith(expect.any(FormData)))

      const formData = mockCreateCoffeeEvaluation.mock.calls[0][0] as FormData
      expect(formData.get('notes')).toBe('')
    })

    it('hides notes when skip_evaluation is enabled and submits notes as empty', async () => {
      mockCreateCoffeeEvaluation.mockResolvedValue(undefined)

      const user = userEvent.setup()
      render(<EvaluationForm />)

      await user.type(screen.getByLabelText(/豆の名前/i), 'Geisha')
      await user.type(screen.getByLabelText(/感想/i), '華やか')
      await user.click(screen.getByLabelText(/評価は後で追加する/i))

      expect(screen.queryByLabelText(/感想/i)).not.toBeInTheDocument()

      await user.click(screen.getByRole('button', { name: /保存/i }))

      await waitFor(() =>
        expect(mockCreateCoffeeEvaluation).toHaveBeenCalledWith(expect.any(FormData))
      )

      const formData = mockCreateCoffeeEvaluation.mock.calls[0][0] as FormData
      expect(formData.get('notes')).toBe('')
    })
  })

  describe('PublicToggle Integration', () => {
    it('renders PublicToggle component with default unchecked state', () => {
      render(<EvaluationForm />)

      const publicToggle = screen.getByTestId('public-toggle')
      expect(publicToggle).toBeInTheDocument()

      const checkbox = screen.getByRole('checkbox', { name: /🔒 非公開/i })
      expect(checkbox).not.toBeChecked()
      expect(screen.getByText(/🔒 非公開/i)).toBeInTheDocument()
    })

    it('renders PublicToggle with checked state when defaultValues.is_public is true', () => {
      render(<EvaluationForm id="eval-123" defaultValues={sampleDefaultValues} />)

      const checkbox = screen.getByRole('checkbox', { name: /🌐 公開/i })
      expect(checkbox).toBeChecked()
      expect(screen.getByText(/🌐 公開/i)).toBeInTheDocument()
    })

    it('toggles PublicToggle and updates label dynamically', async () => {
      const user = userEvent.setup()
      render(<EvaluationForm />)

      let checkbox = screen.getByRole('checkbox', { name: /🔒 非公開/i })
      expect(checkbox).not.toBeChecked()

      await user.click(checkbox)
      checkbox = screen.getByRole('checkbox', { name: /🌐 公開/i })
      expect(checkbox).toBeChecked()

      await user.click(checkbox)
      checkbox = screen.getByRole('checkbox', { name: /🔒 非公開/i })
      expect(checkbox).not.toBeChecked()
    })

    it('includes PublicToggle value in form submission (create mode)', async () => {
      mockCreateCoffeeEvaluation.mockResolvedValue(undefined)

      const user = userEvent.setup()
      render(<EvaluationForm />)

      await user.type(screen.getByLabelText(/店名/i), 'Test Cafe')
      await user.type(screen.getByLabelText(/豆の産地/i), 'Test Bean')
      await user.type(screen.getByLabelText(/豆の名前/i), 'Test Bean Name')

      const checkbox = screen.getByRole('checkbox', { name: /🔒 非公開/i })
      await user.click(checkbox)
      expect(screen.getByRole('checkbox', { name: /🌐 公開/i })).toBeChecked()

      await user.click(screen.getByRole('button', { name: /保存/i }))

      await waitFor(() =>
        expect(mockCreateCoffeeEvaluation).toHaveBeenCalledWith(expect.any(FormData))
      )

      const formData = mockCreateCoffeeEvaluation.mock.calls[0][0] as FormData
      expect(formData.get('is_public')).toBe('true')
    })

    it('includes PublicToggle value in form submission (edit mode)', async () => {
      mockUpdateCoffeeEvaluation.mockResolvedValue(undefined)

      const user = userEvent.setup()
      render(<EvaluationForm id="eval-123" defaultValues={sampleDefaultValues} />)

      const checkbox = screen.getByRole('checkbox', { name: /🌐 公開/i })
      expect(checkbox).toBeChecked()

      await user.click(checkbox)
      expect(screen.getByRole('checkbox', { name: /🔒 非公開/i })).not.toBeChecked()

      await user.click(screen.getByRole('button', { name: /更新/i }))

      await waitFor(() =>
        expect(mockUpdateCoffeeEvaluation).toHaveBeenCalledWith(
          'eval-123',
          expect.any(FormData)
        )
      )

      const formData = mockUpdateCoffeeEvaluation.mock.calls[0][1] as FormData
      expect(formData.get('is_public')).toBe('false')
    })

    it('displays PublicToggle with dynamic emoji label based on initial state', () => {
      const { unmount } = render(<EvaluationForm />)
      expect(screen.getByText(/🔒 非公開/i)).toBeInTheDocument()
      unmount()

      render(<EvaluationForm id="eval-123" defaultValues={sampleDefaultValues} />)
      expect(screen.getByText(/🌐 公開/i)).toBeInTheDocument()
    })
  })
})
