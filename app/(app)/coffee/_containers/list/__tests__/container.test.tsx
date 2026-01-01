import { render, screen, waitFor } from '@testing-library/react'

const mockGetCoffeeEvaluations = jest.fn()
const mockCoffeeListView = jest.fn()

jest.mock('@/lib/api/coffee', () => ({
  getCoffeeEvaluations: (...args: any[]) => mockGetCoffeeEvaluations(...args),
}))

jest.mock(
  '@/app/(app)/coffee/_components/list/view',
  () => ({
    CoffeeListView: (props: any) => {
      mockCoffeeListView(props)
      return <div data-testid="list-view" data-count={props.evaluations?.length} />
    },
  }),
  { virtual: true }
)

// Lazy import after mocks
import { CoffeeListContainer } from '../container'

const sampleEvaluations = [
  {
    id: 'eval-1',
    shop_name: 'Blue Bottle',
    bean_type: 'Ethiopia',
    overall_rating: 8,
    created_at: '2025-01-02T12:00:00.000Z',
  },
  {
    id: 'eval-2',
    shop_name: 'Verve',
    bean_type: 'Kenya',
    overall_rating: 7,
    created_at: '2025-01-03T12:00:00.000Z',
  },
]

describe('CoffeeListContainer (Server Component)', () => {
  beforeEach(() => {
    mockGetCoffeeEvaluations.mockReset()
    mockCoffeeListView.mockReset()
  })

  it('fetches coffee evaluations and passes them to CoffeeListView', async () => {
    mockGetCoffeeEvaluations.mockResolvedValue(sampleEvaluations)

    const ui = await CoffeeListContainer()
    render(ui)

    await waitFor(() => expect(mockGetCoffeeEvaluations).toHaveBeenCalledTimes(1))

    const listView = screen.getByTestId('list-view')
    expect(listView).toHaveAttribute('data-count', sampleEvaluations.length.toString())
    expect(mockCoffeeListView).toHaveBeenCalledWith(
      expect.objectContaining({ evaluations: sampleEvaluations })
    )
  })
})
