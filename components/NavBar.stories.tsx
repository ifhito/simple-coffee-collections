import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { NavBar } from '../app/(app)/_components/nav-bar'

const meta = {
  title: 'NavBar',
  component: NavBar,
} satisfies Meta<typeof NavBar>

export default meta

type Story = StoryObj<typeof meta>

export const SignedIn: Story = {
  args: {
    userEmail: 'barista@example.com',
  },
}

export const SignedOut: Story = {
  args: {
    userEmail: null,
  },
}
