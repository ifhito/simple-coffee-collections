import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { LogoutButton } from './LogoutButton'

const meta = {
  title: 'LogoutButton',
  component: LogoutButton,
} satisfies Meta<typeof LogoutButton>

export default meta

type Story = StoryObj<typeof meta>

export const Button: Story = {}

export const Text: Story = {
  args: {
    variant: 'text',
  },
}
