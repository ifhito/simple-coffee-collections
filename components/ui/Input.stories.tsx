import type { Meta, StoryObj } from '@storybook/react'
import { Input } from './Input'

const meta = {
  title: 'Input',
  component: Input,
  args: {
    label: 'コーヒー豆名',
    placeholder: '例: Ethiopia Yirgacheffe',
  },
  argTypes: {
    disabled: { control: 'boolean' },
    required: { control: 'boolean' },
  },
} satisfies Meta<typeof Input>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithError: Story = {
  args: {
    error: '必須項目です',
  },
}

export const Required: Story = {
  args: {
    required: true,
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
    value: '入力不可',
  },
}
