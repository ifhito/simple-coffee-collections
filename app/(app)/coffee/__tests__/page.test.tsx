import React from 'react'
import { render } from '@testing-library/react'

const mockGetCurrentUser = jest.fn()
const mockRedirect = jest.fn((..._args: unknown[]) => {
  throw new Error('NEXT_REDIRECT')
})
const mockCoffeeListContainer = jest.fn((..._args: unknown[]) => <div data-testid="coffee-list-container" />)

jest.mock('@/lib/api/auth', () => ({
  getCurrentUser: (...args: any[]) => mockGetCurrentUser(...args),
}))

jest.mock('next/navigation', () => ({
  redirect: (...args: any[]) => mockRedirect(...args),
}))

jest.mock('../_components/list/search-and-sort', () => ({
  SearchAndSort: () => <div data-testid="search-and-sort" />,
}))

jest.mock('../_containers/list/container', () => ({
  CoffeeListContainer: (...args: any[]) => mockCoffeeListContainer(...args),
}))

import CoffeeListPage from '../page'

describe('/coffee page redirect logic', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('redirects authenticated users to /coffee/my', async () => {
    mockGetCurrentUser.mockResolvedValue({ id: 'user-123' })

    await expect(async () => {
      await CoffeeListPage()
    }).rejects.toThrow('NEXT_REDIRECT')

    expect(mockRedirect).toHaveBeenCalledWith('/coffee/my')
    expect(mockCoffeeListContainer).not.toHaveBeenCalled()
  })

  it('redirects unauthenticated users to /coffee/community', async () => {
    mockGetCurrentUser.mockRejectedValue(new Error('Auth required'))

    await expect(async () => {
      await CoffeeListPage()
    }).rejects.toThrow('NEXT_REDIRECT')

    expect(mockRedirect).toHaveBeenCalledWith('/coffee/community')
    expect(mockCoffeeListContainer).not.toHaveBeenCalled()
  })
})
