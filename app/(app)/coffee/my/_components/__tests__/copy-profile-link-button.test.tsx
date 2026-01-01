/**
 * RED tests for CopyProfileLinkButton
 */
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CopyProfileLinkButton } from '../copy-profile-link-button'

const mockWriteText = jest.fn()

beforeEach(() => {
  jest.clearAllMocks()
  // @ts-expect-error clipboard is partial
  global.navigator.clipboard = { writeText: mockWriteText }
})

describe('CopyProfileLinkButton', () => {
  it('copies URL to clipboard on click and shows success feedback', async () => {
    mockWriteText.mockResolvedValue(undefined)
    render(<CopyProfileLinkButton url="https://example.com/users/user-123" />)

    const button = screen.getByRole('button', { name: 'プロフィールリンクをコピー' })
    await userEvent.click(button)

    expect(mockWriteText).toHaveBeenCalledWith('https://example.com/users/user-123')
    await waitFor(() => {
      expect(screen.getByText(/コピーしました/i)).toBeInTheDocument()
    })
  })

  it('shows fallback input and error feedback when clipboard write fails', async () => {
    mockWriteText.mockRejectedValue(new Error('denied'))
    render(<CopyProfileLinkButton url="https://example.com/users/user-123" />)

    const button = screen.getByRole('button', { name: 'プロフィールリンクをコピー' })
    await userEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText(/コピーできませんでした/i)).toBeInTheDocument()
    })

    const fallbackInput = screen.getByDisplayValue('https://example.com/users/user-123')
    expect(fallbackInput).toBeInTheDocument()
  })

  it('supports keyboard activation (Enter)', async () => {
    mockWriteText.mockResolvedValue(undefined)
    render(<CopyProfileLinkButton url="https://example.com/users/user-123" />)

    const button = screen.getByRole('button', { name: 'プロフィールリンクをコピー' })
    fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' })

    await waitFor(() => {
      expect(mockWriteText).toHaveBeenCalled()
    })
  })
})
