import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NavBar } from '../nav-bar'

const mockUsePathname = jest.fn(() => '/')

jest.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
}))

jest.mock('@/components/LogoutButton', () => ({
  LogoutButton: ({ variant }: { variant?: string }) => (
    <button data-testid="logout-button" data-variant={variant}>
      ログアウト
    </button>
  ),
}))

jest.mock('@/app/(app)/coffee/_components/shared/bean-mark', () => ({
  BeanMark: () => <span data-testid="bean-mark" />,
}))

describe('NavBar - Hamburger Menu Button (Requirement 1)', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Acceptance Criteria 1 & 2: Button visibility based on screen size', () => {
    it('should display hamburger button on small screens (<640px)', () => {
      render(<NavBar userEmail="test@example.com" />)

      const hamburgerButton = screen.getByRole('button', { name: 'メニュー' })

      expect(hamburgerButton).toBeInTheDocument()
      expect(hamburgerButton).toHaveClass('sm:hidden')
    })

    it('should hide hamburger button on large screens (≥640px) via CSS', () => {
      render(<NavBar userEmail="test@example.com" />)

      const hamburgerButton = screen.getByRole('button', { name: 'メニュー' })
      expect(hamburgerButton).toHaveClass('sm:hidden')
    })
  })

  describe('Acceptance Criteria 3: Hamburger icon when menu is closed', () => {
    it('should show hamburger icon (three lines) when menu is closed', () => {
      render(<NavBar userEmail="test@example.com" />)

      const hamburgerButton = screen.getByRole('button', { name: 'メニュー' })
      const svg = hamburgerButton.querySelector('svg')
      expect(svg).toBeInTheDocument()

      const path = svg?.querySelector('path')
      expect(path?.getAttribute('d')).toContain('6.75h16.5')
      expect(path?.getAttribute('d')).toContain('12h16.5')
      expect(path?.getAttribute('d')).toContain('5.25h16.5')
    })
  })

  describe('Acceptance Criteria 4: Close icon when menu is open', () => {
    it('should show close icon (X) when menu is open', async () => {
      const user = userEvent.setup()
      render(<NavBar userEmail="test@example.com" />)

      const hamburgerButton = screen.getByRole('button', { name: 'メニュー' })
      await user.click(hamburgerButton)

      const svg = hamburgerButton.querySelector('svg')
      const path = svg?.querySelector('path')

      expect(path?.getAttribute('d')).toContain('6 18L18 6')
      expect(path?.getAttribute('d')).toContain('6 6l12 12')
    })
  })

  describe('Acceptance Criteria 5: Focus state on button', () => {
    it('should display focus state when hamburger button receives focus', () => {
      render(<NavBar userEmail="test@example.com" />)

      const hamburgerButton = screen.getByRole('button', { name: 'メニュー' })
      hamburgerButton.focus()

      expect(hamburgerButton).toHaveFocus()
      expect(hamburgerButton).toHaveClass('hover:bg-[var(--background-2)]')
    })

    it('should have proper accessibility attributes', () => {
      render(<NavBar userEmail="test@example.com" />)

      const hamburgerButton = screen.getByRole('button', { name: 'メニュー' })
      expect(hamburgerButton).toHaveAttribute('aria-label', 'メニュー')
      expect(hamburgerButton).toHaveAttribute('aria-expanded', 'false')
    })
  })
})

describe('NavBar - Navigation links (Requirement 5)', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUsePathname.mockReturnValue('/')
  })

  it('renders My Collection link pointing to /coffee/my', () => {
    render(<NavBar userEmail="test@example.com" />)

    const myPageLink = screen.getByRole('link', { name: 'My Collection' })
    expect(myPageLink).toBeInTheDocument()
    expect(myPageLink).toHaveAttribute('href', '/coffee/my')
  })

  it('renders Community link pointing to /coffee/community', () => {
    render(<NavBar userEmail="test@example.com" />)

    const communityLink = screen.getByRole('link', { name: 'Community' })
    expect(communityLink).toBeInTheDocument()
    expect(communityLink).toHaveAttribute('href', '/coffee/community')
  })

  it('highlights active link based on pathname', () => {
    mockUsePathname.mockReturnValue('/coffee/my')
    render(<NavBar userEmail="test@example.com" />)

    const myPageLink = screen.getByRole('link', { name: 'My Collection' })
    const communityLink = screen.getByRole('link', { name: 'Community' })

    expect(myPageLink).toHaveAttribute('aria-current', 'page')
    expect(myPageLink.className).toContain('font-semibold')
    expect(communityLink).not.toHaveAttribute('aria-current')
  })

  it('shows all links in mobile menu when opened', async () => {
    const user = userEvent.setup()
    render(<NavBar userEmail="test@example.com" />)

    const menuButton = screen.getByRole('button', { name: 'メニュー' })
    await user.click(menuButton)

    expect(screen.getAllByRole('link', { name: 'My Collection' }).length).toBeGreaterThanOrEqual(2)
    expect(screen.getAllByRole('link', { name: 'Community' }).length).toBeGreaterThanOrEqual(2)
  })

  it('renders desktop navigation horizontally with new links', () => {
    render(<NavBar userEmail="test@example.com" />)

    const nav = screen.getByRole('navigation', { name: 'メインナビゲーション' })
    expect(nav).toHaveClass('sm:flex')
    expect(screen.getByRole('link', { name: 'My Collection' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Community' })).toBeInTheDocument()
  })
})

describe('NavBar - Menu Toggle (Requirement 2)', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Acceptance Criteria 1: Toggle menu on button click', () => {
    it('should open menu when hamburger button is clicked', async () => {
      const user = userEvent.setup()
      render(<NavBar userEmail="test@example.com" />)

      const hamburgerButton = screen.getByRole('button', { name: 'メニュー' })
      await user.click(hamburgerButton)

      const openLinks = screen.getAllByRole('link', { name: /Community|My Collection/ })
      expect(openLinks.length).toBeGreaterThan(2)
    })

    it('should close menu when close button is clicked', async () => {
      const user = userEvent.setup()
      render(<NavBar userEmail="test@example.com" />)

      const hamburgerButton = screen.getByRole('button', { name: 'メニュー' })

      await user.click(hamburgerButton)
      const openLinks = screen.getAllByRole('link', { name: /Community|My Collection/ })
      expect(openLinks.length).toBeGreaterThan(2)

      await user.click(hamburgerButton)
      expect(screen.getAllByText(/Community/).length).toBe(1)
    })
  })

  describe('Acceptance Criteria 2: Display navigation and user menu when open', () => {
    it('should display navigation links when menu is open', async () => {
      const user = userEvent.setup()
      render(<NavBar userEmail="test@example.com" />)

      const hamburgerButton = screen.getByRole('button', { name: 'メニュー' })
      await user.click(hamburgerButton)

      const links = screen.getAllByRole('link', { name: /Community|My Collection/ })
      expect(links.length).toBeGreaterThan(2)
    })

    it('should display user menu when logged in and menu is open', async () => {
      const user = userEvent.setup()
      render(<NavBar userEmail="test@example.com" />)

      const hamburgerButton = screen.getByRole('button', { name: 'メニュー' })
      await user.click(hamburgerButton)

      const profileLinks = screen.getAllByText('プロフィール')
      expect(profileLinks.length).toBeGreaterThan(1)

      const logoutButtons = screen.getAllByTestId('logout-button')
      expect(logoutButtons.length).toBeGreaterThan(1)
    })
  })

  describe('Acceptance Criteria 3: Close menu after clicking navigation link', () => {
    it('should close menu after clicking Community link', async () => {
      const user = userEvent.setup()
      render(<NavBar userEmail="test@example.com" />)

      const hamburgerButton = screen.getByRole('button', { name: 'メニュー' })
      await user.click(hamburgerButton)

      const communityLinks = screen.getAllByText(/Community/)
      const mobileCommunityLink = communityLinks[1]
      await user.click(mobileCommunityLink)

      const communityLinksAfter = screen.getAllByText(/Community/)
      expect(communityLinksAfter.length).toBe(1)
    })

    it('should close menu after clicking profile link', async () => {
      const user = userEvent.setup()
      render(<NavBar userEmail="test@example.com" />)

      const hamburgerButton = screen.getByRole('button', { name: 'メニュー' })
      await user.click(hamburgerButton)

      const profileLinks = screen.getAllByText('プロフィール')
      const mobileProfileLink = profileLinks[1]
      await user.click(mobileProfileLink)

      const profileLinksAfter = screen.queryAllByText('プロフィール')
      expect(profileLinksAfter.length).toBe(1)
    })
  })

  describe('Acceptance Criteria 5: Update aria-expanded based on menu state', () => {
    it('should set aria-expanded to true when menu is open', async () => {
      const user = userEvent.setup()
      render(<NavBar userEmail="test@example.com" />)

      const hamburgerButton = screen.getByRole('button', { name: 'メニュー' })
      expect(hamburgerButton).toHaveAttribute('aria-expanded', 'false')

      await user.click(hamburgerButton)
      expect(hamburgerButton).toHaveAttribute('aria-expanded', 'true')
    })

    it('should set aria-expanded to false when menu is closed', async () => {
      const user = userEvent.setup()
      render(<NavBar userEmail="test@example.com" />)

      const hamburgerButton = screen.getByRole('button', { name: 'メニュー' })

      await user.click(hamburgerButton)
      expect(hamburgerButton).toHaveAttribute('aria-expanded', 'true')

      await user.click(hamburgerButton)
      expect(hamburgerButton).toHaveAttribute('aria-expanded', 'false')
    })
  })
})
