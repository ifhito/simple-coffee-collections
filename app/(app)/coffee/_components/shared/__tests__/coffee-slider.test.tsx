import type { ComponentProps } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CoffeeSlider } from '../coffee-slider'

const setup = (overrideProps: Partial<ComponentProps<typeof CoffeeSlider>> = {}) => {
  const onChange = jest.fn()
  const props: ComponentProps<typeof CoffeeSlider> = {
    label: 'Acidity',
    value: 5,
    onChange,
    min: 1,
    max: 10,
    step: 1,
    ...overrideProps,
  }

  render(<CoffeeSlider {...props} />)
  const slider = screen.getByRole('slider', { name: props.label })
  const user = userEvent.setup()

  return { slider, onChange, props, user }
}

describe('CoffeeSlider', () => {
  it('renders a range slider with default bounds and aria state', () => {
    const { slider, props } = setup()

    expect(slider).toHaveAttribute('type', 'range')
    expect(slider).toHaveAttribute('min', props.min!.toString())
    expect(slider).toHaveAttribute('max', props.max!.toString())
    expect(slider).toHaveAttribute('step', props.step!.toString())
    expect(slider).toHaveAttribute('aria-valuenow', props.value.toString())
    expect(slider).toHaveAttribute('aria-valuemin', props.min!.toString())
    expect(slider).toHaveAttribute('aria-valuemax', props.max!.toString())
  })

  it('calls onChange when the slider value changes', () => {
    const { slider, onChange } = setup()

    fireEvent.change(slider, { target: { value: '7' } })

    expect(onChange).toHaveBeenCalledWith(7)
  })

  it('supports keyboard arrow navigation to increment and decrement', async () => {
    const { slider, onChange, user } = setup({ value: 5 })

    await user.click(slider)
    await user.keyboard('{ArrowRight}')
    await user.keyboard('{ArrowLeft}')

    expect(onChange).toHaveBeenCalledTimes(2)
    expect(onChange).toHaveBeenNthCalledWith(1, 6)
    expect(onChange).toHaveBeenNthCalledWith(2, 4)
  })

  it('does not go below the minimum value when pressing ArrowLeft', async () => {
    const { slider, onChange, user } = setup({ value: 1, min: 1 })

    await user.click(slider)
    await user.keyboard('{ArrowLeft}')

    expect(onChange).not.toHaveBeenCalled()
  })

  it('does not exceed the maximum value when pressing ArrowRight', async () => {
    const { slider, onChange, user } = setup({ value: 10, max: 10 })

    await user.click(slider)
    await user.keyboard('{ArrowRight}')

    expect(onChange).not.toHaveBeenCalled()
  })

  it('respects custom bounds and step attributes', () => {
    const { slider } = setup({ value: 20, min: 10, max: 50, step: 5, label: 'Aroma' })

    expect(slider).toHaveAttribute('min', '10')
    expect(slider).toHaveAttribute('max', '50')
    expect(slider).toHaveAttribute('step', '5')
    expect(slider).toHaveAttribute('aria-valuenow', '20')
    expect(slider).toHaveAccessibleName('Aroma')
  })
})
